import * as PIXI from 'pixi.js';

import { Scene } from '../scene/scene';
import { Point3D, createPoint } from '../position/point';
import { BLOCK_SIZE, CHUNK_SIZE, WORLD_SIZE } from '../config';
import { multiply } from '../calc/calc';
import { Chunk, createChunk } from '../chunk/chunk';
import { BlockType } from '../block/block-type';
import {
    isIntegerPoint3D,
    convertblockIndexToChunkIndex as chunkIndexFromBlockIndex,
    convertblockIndexToChunkIndex as convertBlockIndexToChunkIndex,
    convertBlockIndexToLocalChunkIndex,
} from '../position/point-utils';
import { GameObject } from '../game-object/game-object';
import {
    collection3d,
    getPointInCollection3D,
    setPointInCollection3D,
    createCollection3D,
} from '../collection/collection';
import { GameObjectRepository } from '../game-object/game-object-repository';
import {
    getPointInBlockRepository,
    setPointInBlockRepository,
} from '../block/block-repository';

export function updateTerrain(scene: Scene, terrain: Terrain): void {
    console.log('Nothing to do fml', terrain, scene);
}

export type blockSetter = (blockIndex: Point3D, type: BlockType) => boolean;
export type blockGetter = (blockIndex: Point3D) => BlockType;

export interface Terrain extends GameObject {
    chunks: collection3d<Chunk>;
    setBlock: blockSetter;
    getBlock: blockGetter;
}

/**
 *
 * @param chunks is collection of chunks.
 * @param gameObjects is the repopository that is used to create new chunks.
 */
export function createBlockSetter(
    chunks: collection3d<Chunk>,
    gameObjects: GameObjectRepository,
): blockSetter {
    return function(index, type): boolean {
        if (isIntegerPoint3D(index)) {
            const chunkIndex = chunkIndexFromBlockIndex(index);
            let chunk = getPointInCollection3D(chunkIndex, chunks);
            // Create chunk if not exist
            if (!chunk) {
                chunk = createChunk(
                    `chunk-${chunkIndex.x}.${chunkIndex.y}.${chunkIndex.z}`,
                    multiply(CHUNK_SIZE * BLOCK_SIZE, chunkIndex),
                );
                setPointInCollection3D(chunkIndex, chunks, chunk);

                // Register the new chunk
                gameObjects.setGameObject(chunk);
                gameObjects.activateGameObject(chunk.id);
            }
            setPointInBlockRepository(
                convertBlockIndexToLocalChunkIndex(index),
                chunk.blocks,
                type,
            );
        }
        return true;
    };
}

export function createBlockGetter(chunks: collection3d<Chunk>): blockGetter {
    return function(blockIndex): BlockType {
        if (isIntegerPoint3D(blockIndex)) {
            const chunkIndex = convertBlockIndexToChunkIndex(blockIndex);
            let chunk = getPointInCollection3D(chunkIndex, chunks);
            if (!chunk) {
                return null;
            }
            return getPointInBlockRepository(
                convertBlockIndexToLocalChunkIndex(blockIndex),
                chunk.blocks,
            );
        }
        return null;
    };
}

export function createTerrain(
    id: string,
    gameObjects: GameObjectRepository,
): Terrain {
    const chunks = createCollection3D<Chunk>(WORLD_SIZE);
    return {
        id: id,
        position: createPoint(),
        chunks: chunks,
        components: [updateTerrain.name],
        setBlock: createBlockSetter(chunks, gameObjects),
        getBlock: createBlockGetter(chunks),
    };
}
