import * as PIXI from 'pixi.js';

import { GameObject } from '../game-object/game-object';
import { Block, renderBlockViews } from '../block/block';
import { Point3D } from '../position/point';
import { CHUNK_SIZE, WORLD_SIZE, BLOCK_SIZE } from '../config';
import { divideBy, multiply } from '../calc/calc';
import { getVisibleBlocksIndexes, isPositionWithinChunk } from './chunk-utils';
import { sortZYXAsc } from '../calc/sort';
import {
    floorPos,
    convertPositionToBlockIndex,
    convertBlockIndexToLocalChunkIndex,
} from '../position/point-utils';
import { Terrain } from '../terrain/terrain';
import { Scene } from '../scene/scene';
import { BlockType } from '../block/block-type';
import {
    createBlockRepository,
    blockRepository,
    getPointInBlockRepository,
} from '../block/block-repository';
import { GameScene } from '../scene/game-scene';

export interface Chunk extends GameObject {
    blocks: blockRepository;
    blocksToRender: Point3D[];
    views: PIXI.Container[];
    terrain: Terrain;
    hasChanged: boolean;
}

function createBlockGetter(
    chunk: Chunk,
    terrain: Terrain,
): (blockIndex: Point3D) => BlockType {
    return function(blockIndex: Point3D) {
        if (isPositionWithinChunk(blockIndex, chunk.position)) {
            return getPointInBlockRepository(
                convertBlockIndexToLocalChunkIndex(blockIndex),
                chunk.blocks,
            );
        }
        return terrain.getBlock(blockIndex);
    };
}

export function updateChunk(scene: GameScene, chunk: Chunk): void {
    if (!chunk.hasChanged) {
        return;
    }

    const getBlock = createBlockGetter(chunk, scene.terrain);

    chunk.blocksToRender = getVisibleBlocksIndexes(chunk);
    // Sort
    chunk.blocksToRender.sort(
        (idA, idB): number => {
            return sortZYXAsc(idA, idB);
        },
    );

    const blockLayers: PIXI.Container[] = [];

    // Clear that shit.
    chunk.views.forEach((l): void => void l.destroy({ children: true }));

    chunk.blocksToRender.forEach(
        (blockIndex): void => {
            const blockType = getBlock(blockIndex);
            const blockPosition = multiply(BLOCK_SIZE, blockIndex);

            const index = blockPosition.y;
            let layer = blockLayers[index];

            if (!blockLayers[index]) {
                layer = new PIXI.Container();
                layer.sortableChildren = false;
                layer.position.set(chunk.position.x, chunk.position.y);
                layer.name = `BlockLayer: ${chunk.position.x} ${
                    chunk.position.y
                } ${chunk.position.z}`;
                blockLayers[index] = layer;

                chunk.views[index] = layer;
                scene.stage.addChild(layer);
            }

            const localIndex = convertBlockIndexToLocalChunkIndex(blockIndex);

            const drawX = localIndex.x * BLOCK_SIZE;
            const drawY =
                localIndex.y * BLOCK_SIZE -
                localIndex.z * BLOCK_SIZE +
                BLOCK_SIZE * CHUNK_SIZE;

            let frontColor = null;
            // Front
            switch (blockType) {
                case BlockType.ROCK:
                    frontColor = 0x5a5a5a;
                    break;
                case BlockType.GRASS:
                    frontColor = 0x795128;
                    break;
                case BlockType.SELECTION:
                    frontColor = 0xff4d4d;
                    break;
                default:
                    frontColor = 0x9e34a1;
                    break;
            }
            const spriteFront = new PIXI.Sprite(PIXI.Texture.WHITE);
            spriteFront.tint = frontColor;
            spriteFront.width = spriteFront.height = BLOCK_SIZE;
            spriteFront.position.set(drawX, drawY);
            layer.addChild(spriteFront);

            let topColor = null;
            // Top
            switch (blockType) {
                case BlockType.ROCK:
                    topColor = 0xa5a5a5;
                    break;
                case BlockType.GRASS:
                    topColor = 0x008000;
                    break;
                case BlockType.SELECTION:
                    topColor = 0xe60000;
                    break;
                default:
                    topColor = 0xff00d1;
                    break;
            }
            const spriteTop = new PIXI.Sprite(PIXI.Texture.WHITE);
            spriteTop.tint = topColor;
            spriteTop.width = spriteTop.height = BLOCK_SIZE;
            spriteTop.position.set(drawX, drawY - BLOCK_SIZE);
            layer.addChild(spriteTop);
        },
    );

    chunk.views = blockLayers;
    chunk.hasChanged = false;
}

export function createChunk(id: string, position: Point3D): Chunk {
    const blocks = createBlockRepository();
    return {
        id: id,
        position: position,
        blocks: blocks,
        blocksToRender: [],
        views: [],
        terrain: null,
        hasChanged: true,
        components: [updateChunk.name],
    };
}

export const chunkDivider = (size: number) => (point: Point3D) =>
    floorPos(divideBy(size, point));
