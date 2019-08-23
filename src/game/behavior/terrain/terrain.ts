import * as PIXI from 'pixi.js';

import { BlockType } from '../block/block-type';
import { CHUNK_SIZE, BLOCK_SIZE } from '../../config';
import {
    setBlock,
    getBlock,
    createBlockRepository,
} from '../block/block-repository';
import { Point3D } from '../../position/point';
import { Engine } from '../../engine/engine';
import { isIntegerPoint3D } from '../../position/point-utils';
import {
    convertWorldIndexToChunkIndex,
    convertWorldIndexToLocalIndex,
} from '../../utils/index-utils';
import { ChunkComponent } from '../chunk/chunk-component';
import { Components } from '../../components/components';
import { TerrainComponent } from './terrain-component';
import { getChunkId as createChunkPosId } from '../chunk/chunk-utils';
import { Component } from '../../components/component';
import { multiply } from '../../calc/calc';

export type blockSetter = (blockIndex: Point3D, type: BlockType) => boolean;
export type blockGetter = (blockIndex: Point3D) => BlockType;

export function createBlockSetter(
    terrainGameObjectId: string,
    engine: Engine,
): blockSetter {
    const terrain = engine.getComponent<TerrainComponent>(
        terrainGameObjectId,
        Components.TERRAIN,
    );

    return function(blockIndex: Point3D, type: BlockType): boolean {
        if (isIntegerPoint3D(blockIndex)) {
            const chunkIndex = convertWorldIndexToChunkIndex(blockIndex);

            let chunkComponent: Component<ChunkComponent> = null;
            const chunkPosId = createChunkPosId(chunkIndex);

            if (terrain.state.chunks.hasOwnProperty(chunkPosId)) {
                const chunkId = terrain.state.chunks[chunkPosId];
                chunkComponent = engine.getComponent<ChunkComponent>(
                    chunkId,
                    Components.CHUNK,
                );
            }

            // Create chunk if not exist
            if (!chunkComponent) {
                // Register the new chunk
                const chunkId = engine.createGameObject(
                    multiply(BLOCK_SIZE * CHUNK_SIZE, chunkIndex),
                );
                chunkComponent = engine.addComponent<ChunkComponent>(
                    chunkId,
                    Components.CHUNK,
                    {
                        blocks: createBlockRepository(
                            CHUNK_SIZE,
                            CHUNK_SIZE,
                            CHUNK_SIZE,
                        ),
                        terrainId: terrainGameObjectId,
                        hasChanged: true,
                    },
                );
                engine.activateGameObject(chunkId);
                terrain.state.chunks[chunkPosId] = chunkId;
            }

            setBlock(
                convertWorldIndexToLocalIndex(blockIndex),
                chunkComponent.state.blocks,
                type,
            );

            engine.updateComponent(chunkComponent.id, chunkComponent.state);
        }
        return true;
    };
}

export function createBlockGetter(
    terrainGameObjectId: string,
    engine: Engine,
): blockGetter {
    const terrain = engine.getComponent<TerrainComponent>(
        terrainGameObjectId,
        Components.TERRAIN,
    );

    return function(blockIndex): BlockType {
        if (isIntegerPoint3D(blockIndex)) {
            const chunkIndex = convertWorldIndexToChunkIndex(blockIndex);
            let chunk: Component<ChunkComponent> = null;
            const chunkPosId = createChunkPosId(chunkIndex);

            if (terrain.state.chunks.hasOwnProperty(chunkPosId)) {
                const chunkId = terrain.state.chunks[chunkPosId];
                chunk = engine.getComponent<ChunkComponent>(
                    chunkId,
                    Components.CHUNK,
                );
            }

            if (!chunk) {
                return null;
            }
            return getBlock(
                convertWorldIndexToLocalIndex(blockIndex),
                chunk.state.blocks,
            );
        }
        return null;
    };
}
