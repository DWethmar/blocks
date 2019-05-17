import * as PIXI from 'pixi.js';

import { Scene } from '../scene/scene';
import { Point3D, createPoint } from '../position/point';
import { Block, createBlock } from '../block/block';
import { BLOCK_SIZE, CHUNK_SIZE, WORLD_SIZE } from '../config';
import { multiply } from '../calc/calc';
import { Chunk, createChunk } from '../chunk/chunk';
import { BlockType } from '../block/block-type';
import {
    isIntegerPoint3D,
    convertblockIndexToChunkIndex as chunkIndexFromBlockIndex,
    convertblockIndexToChunkIndex,
} from '../position/point-utils';
import { GameObject } from '../game-object/game-object';
import { collection3d, getPointInCollection3D, setPointInCollection3D, createCollection3D } from '../collection/collection';
import { GameObjectRepository } from '../game-object/game-object-repository';

export function updateTerrain(terrain: Terrain, scene: Scene): void {
    console.log('Nothing to do fml', terrain, scene);
}

export type blockSetter = (blockIndex: Point3D, type: BlockType) => Block;
export type blockGetter = (blockIndex: Point3D) => Block;


export interface Terrain extends GameObject {
    chunks: collection3d<Chunk>;
    setBlock: blockSetter;
    getBlock: blockGetter;
}


export function createBlockSetter(chunks: collection3d<Chunk>, gameObjects: GameObjectRepository): blockSetter {
    return function(index, type): Block {
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
            const block = createBlock(null, multiply(BLOCK_SIZE, index), type);
            chunk.setBlock(block);
            return block;
        }
        return null;
    };
}

export function createBlockGetter(chunks: collection3d<Chunk>, gameObjects: GameObjectRepository): blockGetter {
    return function (index): Block {
        if (isIntegerPoint3D(index)) {
            const chunkIndex = convertblockIndexToChunkIndex(index);
            let chunk = getPointInCollection3D(chunkIndex, chunks);
            // Create chunk if not exist
            if (!chunk) {
                return null;
            }
            return chunk.getBlock(index);;
        }
        return null;
    };
}

export function createTerrain(id: string, gameObjects: GameObjectRepository): Terrain {
    const chunks = createCollection3D<Chunk>(WORLD_SIZE);
    return {
        id: id,
        position: createPoint(),
        chunks: chunks,
        components: [updateTerrain.name],
        setBlock: createBlockSetter(chunks, gameObjects),
        getBlock: createBlockGetter(chunks, gameObjects)
    };
}
