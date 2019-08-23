import * as PIXI from 'pixi.js';

import { Engine } from '../../engine/engine';
import { System } from '../../engine/system';
import { Components } from '../../components/components';
import { Component } from '../../components/component';
import { ChunkComponent } from './chunk-component';
import { Point3D, createPoint } from '../../position/point';
import { isWithin, minusPos, addPos } from '../../position/point-utils';
import {
    convertPositionToChunkIndex,
    convertWorldIndexToChunkIndex,
} from '../../utils/index-utils';
import { CHUNK_SIZE, BLOCK_SIZE } from '../../config';
import {
    blockRepository,
    iterateBlocks,
    getBlock,
} from '../block/block-repository';
import { BlockType } from '../block/block-type';
import { sortZYXAsc } from '../../calc/sort';
import { AssetRepository } from '../../assets/asset-repository';
import { multiply } from '../../calc/calc';
import { getDrawPosition } from '../../utils/game-object-utils';
import { isBlockTransparent } from '../block/block-utils';

export function isPositionWithinChunk(
    localIndex: Point3D,
    chunkIndex: Point3D,
): boolean {
    return isWithin(
        localIndex,
        minusPos(convertPositionToChunkIndex(chunkIndex), createPoint(1, 1, 1)),
        addPos(
            convertPositionToChunkIndex(chunkIndex),
            createPoint(CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE),
        ),
    );
}

export function isPosVisibleWithinChunk(
    localIndex: Point3D,
    chunkIndex: Point3D,
    blocks: blockRepository,
): boolean {
    if (isPositionWithinChunk(localIndex, chunkIndex)) {
        const blockType = getBlock(localIndex, blocks);
        if (!blockType || isBlockTransparent(blockType)) {
            return isPosVisibleWithinChunk(
                addPos(localIndex, createPoint(0, 1, 1)),
                chunkIndex,
                blocks,
            );
        } else {
            return false;
        }
    }
    return true;
}

export function calculateVisibleBlocksIndexes(
    blocks: blockRepository,
): Point3D[] {
    return Array.from(iterateBlocks(blocks))
        .filter(
            ([, blockType]: [Point3D, BlockType]) =>
                blockType !== BlockType.AIR,
        )
        .reduce<Point3D[]>(
            (localIndexes, [localIndex]: [Point3D, BlockType]) => {
                const blockIndex = addPos(localIndex, createPoint(0, 1, 1));

                if (
                    isPosVisibleWithinChunk(
                        blockIndex,
                        convertWorldIndexToChunkIndex(blockIndex),
                        blocks,
                    )
                ) {
                    localIndexes.push(localIndex);
                }

                return localIndexes;
            },
            [],
        );
}

export class ChunkSystem extends System {
    private readonly stage: PIXI.Container;
    private readonly assets: AssetRepository;

    public constructor(stage: PIXI.Container, assets: AssetRepository) {
        super();
        this.stage = stage;
        this.assets = assets;
    }

    public update(engine: Engine, delta: number): void {
        engine
            .getAllComponents(Components.CHUNK)
            .forEach((c: Component<ChunkComponent>) => {
                this.updateChunk(engine, c);
            });
    }

    public updateChunk(engine: Engine, chunk: Component<ChunkComponent>): void {
        if (!chunk.state.hasChanged) {
            return;
        }
        // Calculate which blocks are visible.
        const blocksToRender = calculateVisibleBlocksIndexes(
            chunk.state.blocks,
        );

        blocksToRender.sort((idA, idB): number => {
            return sortZYXAsc(idA, idB);
        });

        const position = engine.getComponent<Point3D>(
            chunk.gameObjectId,
            Components.POSITION,
        );

        blocksToRender.forEach((localIndex): void => {
            const blockType = getBlock(localIndex, chunk.state.blocks);
            const blockPosition = multiply(BLOCK_SIZE, localIndex);
            const [drawX, drawY, zIndex] = getDrawPosition(position.state);
            const index = blockPosition.y;
            const layerName = `chunk-${chunk.id}-${index}`;

            let layer: PIXI.Container = this.stage.getChildByName(
                layerName,
            ) as PIXI.Container;

            // Create if layer not exists, else destroy children.
            if (!layer) {
                layer = new PIXI.Container();
                layer.name = layerName;
                // layer.x = drawX;
                // layer.y = drawY;
                layer.position.set(drawX, drawY - CHUNK_SIZE * BLOCK_SIZE);
                layer.sortableChildren = false;
                layer.zIndex = index + zIndex;
                this.stage.addChild(layer);
            } else {
                // layer.children.forEach(c => c.destroy());
            }

            const [bDrawX, bDrawY] = getDrawPosition(blockPosition);

            if (blockType === BlockType.GRASS) {
                const spriteTop = new PIXI.Sprite(
                    this.assets.spritesheet.textures['grass_top'],
                );
                spriteTop.width = BLOCK_SIZE;
                spriteTop.height = BLOCK_SIZE;
                spriteTop.position.set(bDrawX, bDrawY - BLOCK_SIZE);
                layer.addChild(spriteTop);

                const spriteFront = new PIXI.Sprite(
                    this.assets.spritesheet.textures['grass_front'],
                );
                spriteFront.width = BLOCK_SIZE;
                spriteFront.height = BLOCK_SIZE;
                spriteFront.position.set(bDrawX, bDrawY);
                layer.addChild(spriteFront);
            } else {
                const spriteTop = new PIXI.Sprite(
                    this.assets.spritesheet.textures['rock_top'],
                );
                spriteTop.width = BLOCK_SIZE;
                spriteTop.height = BLOCK_SIZE;
                spriteTop.position.set(bDrawX, bDrawY - BLOCK_SIZE);
                layer.addChild(spriteTop);

                const spriteFront = new PIXI.Sprite(
                    this.assets.spritesheet.textures['rock_front'],
                );
                spriteFront.width = BLOCK_SIZE;
                spriteFront.height = BLOCK_SIZE;
                spriteFront.position.set(bDrawX, bDrawY);
                layer.addChild(spriteFront);
            }
        });
        chunk.state.hasChanged = false;
        engine.updateComponent(chunk.id, chunk.state);
    }
}
