import * as PIXI from 'pixi.js';

import { GameObject, Point3D, sortZYXAsc, multiply } from '@blocks/core';
import {
    blockRepository,
    getBlock,
    createBlockRepository,
} from '../block/block-repository';
import { Terrain } from '../terrain/terrain';
import { BlockType } from '../block/block-type';
import {
    isPositionWithinChunk,
    calculateVisibleBlocksIndexes,
} from './chunk-utils';
import { GameScene } from '../scene/game-scene';
import { BLOCK_SIZE, CHUNK_SIZE } from '../config';
import { getDrawPosition } from '../utils/game-object-utils';
import { convertPositionToChunkIndex } from '../terrain/index-utils';

export interface Chunk extends GameObject {
    blocks: blockRepository;
    views: PIXI.Container[];
    terrain: Terrain;
    hasChanged: boolean;
}

function createBlockGetter(
    chunk: Chunk,
    terrain: Terrain,
): (localIndex: Point3D) => BlockType {
    return function(localIndex: Point3D) {
        const chunkIndex = convertPositionToChunkIndex(chunk.position);
        if (isPositionWithinChunk(localIndex, chunkIndex)) {
            return getBlock(localIndex, chunk.blocks);
        }
        return null;
    };
}

export function updateChunk(scene: GameScene, chunk: Chunk): void {
    if (!chunk.hasChanged) {
        return;
    }
    // Calculate which blocks are visible.
    const blocksToRender = calculateVisibleBlocksIndexes(chunk);

    // | Render all blocks from this chunk |
    // const blocksToRender = Array.from(iterateBlocks(chunk.blocks))
    //     .filter(
    //         ([, blockType]: [Point3D, BlockType]) =>
    //             blockType !== BlockType.AIR,
    //     )
    //     .map(([point, blockType]: [Point3D, BlockType]) => point);

    blocksToRender.sort(
        (idA, idB): number => {
            return sortZYXAsc(idA, idB);
        },
    );

    const blockLayers: PIXI.Container[] = [];

    // Clear that shit.
    chunk.views.forEach((l): void => void l.destroy({ children: true }));

    blocksToRender.forEach(
        (localIndex): void => {
            const blockType = getBlock(localIndex, chunk.blocks);

            const blockPosition = multiply(BLOCK_SIZE, localIndex);

            const [drawX, drawY, zIndex] = getDrawPosition(chunk.position);
            // Ball.view.position.set(drawX, drawY);
            // Ball.view.zIndex = zIndex;

            const index = blockPosition.y;
            let layer = blockLayers[index];

            if (!blockLayers[index]) {
                layer = new PIXI.Container();
                layer.sortableChildren = false;
                layer.position.set(drawX, drawY - CHUNK_SIZE * BLOCK_SIZE);
                layer.name = `BlockLayer: ${chunk.position.x} ${
                    chunk.position.y
                } ${chunk.position.z}`;
                layer.zIndex = index + zIndex;

                blockLayers[index] = layer;

                chunk.views[index] = layer;
                scene.stage.addChild(layer);
            }

            const [bDrawX, bDrawY] = getDrawPosition(blockPosition);

            if (blockType === BlockType.GRASS) {
                const spriteTop = new PIXI.Sprite(
                    scene.assets.spritesheet.textures['grass_top'],
                );
                spriteTop.width = BLOCK_SIZE;
                spriteTop.height = BLOCK_SIZE;
                spriteTop.position.set(bDrawX, bDrawY - BLOCK_SIZE);
                layer.addChild(spriteTop);

                const spriteFront = new PIXI.Sprite(
                    scene.assets.spritesheet.textures['grass_front'],
                );
                spriteFront.width = BLOCK_SIZE;
                spriteFront.height = BLOCK_SIZE;
                spriteFront.position.set(bDrawX, bDrawY);
                layer.addChild(spriteFront);
            } else {
                const spriteTop = new PIXI.Sprite(
                    scene.assets.spritesheet.textures['rock_top'],
                );
                spriteTop.width = BLOCK_SIZE;
                spriteTop.height = BLOCK_SIZE;
                spriteTop.position.set(bDrawX, bDrawY - BLOCK_SIZE);
                layer.addChild(spriteTop);

                const spriteFront = new PIXI.Sprite(
                    scene.assets.spritesheet.textures['rock_front'],
                );
                spriteFront.width = BLOCK_SIZE;
                spriteFront.height = BLOCK_SIZE;
                spriteFront.position.set(bDrawX, bDrawY);
                layer.addChild(spriteFront);
            }
        },
    );

    chunk.views = blockLayers;
    chunk.hasChanged = false;
}

export function createChunk(id: string, position: Point3D): Chunk {
    return {
        id: id,
        position: position,
        blocks: createBlockRepository(CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE),
        views: [],
        terrain: null,
        hasChanged: true,
        components: [updateChunk.name],
    };
}