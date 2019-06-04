import * as PIXI from 'pixi.js';

import {
    chunkRepository,
    getChunk,
    setChunk,
    createChunkRepository,
} from '../chunk/chunk-repository';
import { Scene, Point3D, GameObject, GameObjectRepository, multiply, createPoint } from '@blocks/core';
import { BlockType } from '../block/block-type';
import { isIntegerPoint3D } from '@blocks/core';
import { createChunk } from '../chunk/chunk';
import { CHUNK_SIZE, BLOCK_SIZE } from '../config';
import { setBlock, getBlock } from '../block/block-repository';
import { convertWorldIndexToLocalIndex, convertWorldIndexToChunkIndex } from './index-utils';

export function updateTerrain(scene: Scene, terrain: Terrain): void {
    console.log('Nothing to do fml', terrain, scene);
}

export type blockSetter = (blockIndex: Point3D, type: BlockType) => boolean;
export type blockGetter = (blockIndex: Point3D) => BlockType;

export interface Terrain extends GameObject {
    chunks: chunkRepository;
    setBlock: blockSetter;
    getBlock: blockGetter;
}

/**
 *
 * @param chunks is collection of chunks.
 * @param gameObjects is the repository that is used to create new chunks.
 */
export function createBlockSetter(
    chunks: chunkRepository,
    gameObjects: GameObjectRepository,
): blockSetter {
    return function(blockIndex, type): boolean {
        if (isIntegerPoint3D(blockIndex)) {
            const chunkIndex = convertWorldIndexToChunkIndex(blockIndex);
            let chunk = getChunk(chunkIndex, chunks);
            // Create chunk if not exist
            if (!chunk) {
                chunk = createChunk(
                    `chunk-${chunkIndex.x}.${chunkIndex.y}.${chunkIndex.z}`,
                    multiply(CHUNK_SIZE * BLOCK_SIZE, chunkIndex),
                );
                setChunk(chunk, chunks);

                // Register the new chunk
                gameObjects.add(chunk);
                gameObjects.activate(chunk.id);
            }
            setBlock(
                convertWorldIndexToLocalIndex(blockIndex),
                chunk.blocks,
                type,
            );
        }
        return true;
    };
}

export function createBlockGetter(chunks: chunkRepository): blockGetter {
    return function(blockIndex): BlockType {
        if (isIntegerPoint3D(blockIndex)) {
            const chunkIndex = convertWorldIndexToChunkIndex(blockIndex);
            let chunk = getChunk(chunkIndex, chunks);
            if (!chunk) {
                return null;
            }
            return getBlock(
                convertWorldIndexToLocalIndex(blockIndex),
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
    const chunks = createChunkRepository();
    return {
        id: id,
        position: createPoint(),
        chunks: chunks,
        components: [updateTerrain.name],
        setBlock: createBlockSetter(chunks, gameObjects),
        getBlock: createBlockGetter(chunks),
    };
}