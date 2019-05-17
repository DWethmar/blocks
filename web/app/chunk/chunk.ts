import * as PIXI from 'pixi.js';

import { GameObject } from '../game-object/game-object';
import { Block, renderBlockViews } from '../block/block';
import { Point3D } from '../position/point';
import { CHUNK_SIZE } from '../config';
import { divideBy } from '../calc/calc';
import { getVisibleBlockIndexes } from './chunk-utils';
import { sortZYXAsc } from '../calc/sort';
import { floorPos } from '../position/point-utils';
import { Terrain } from '../terrain/terrain';
import { Scene } from '../scene/scene';

export function getBlockFromBlockList(point: Point3D, blocks: Block[], chunkSize: number = CHUNK_SIZE): Block {
    return blocks[point.x + chunkSize * (point.y + chunkSize * point.z)];
}

export function setBlockInBlockList(block: Block, blocks: Block[], chunkSize: number = CHUNK_SIZE): Block[] {
    blocks[block.position.x + chunkSize * (block.position.y + chunkSize * block.position.z)] = block;
    return blocks;
}

export const createBlockSelector = (chunk: Chunk): ((blockIndex: Point3D) => Block) => (blockIndex: Point3D): Block =>
    getBlockFromBlockList(blockIndex, chunk.blocks);

export interface Chunk extends GameObject {
    blocks: Block[];
    blocksToRender: Point3D[];
    views: PIXI.Container[];
    terrain: Terrain;
    hasChanged: boolean;
}

export function updateChunk(chunk: Chunk, scene: Scene): void {
    console.log(`Updating chunk: ${chunk.id}`);

    if (!chunk.hasChanged) {
        return;
    }

    const terrain = (scene.getGameObjectById('terrain') as unknown) as Terrain;

    const getBlock = (p: Point3D): Block => getBlockFromBlockList(p, chunk.blocks);

    chunk.blocksToRender = getVisibleBlockIndexes(chunk);

    // Sort
    chunk.blocksToRender.sort(
        (idA, idB): number => {
            return sortZYXAsc(this.blocks.get(idA).position, this.blocks.get(idB).position);
        },
    );

    const blockLayers: PIXI.Container[] = [];

    chunk.blocksToRender.forEach(
        (blockIndex): void => {
            const block = getBlock(blockIndex);

            const index = block.position.y;
            let layer = null;

            if (blockLayers[index]) {
                layer = blockLayers[index];
            } else {
                layer = new PIXI.Container();
                layer.sortableChildren = false;
                layer.name = `BlockLayer: ${this.position.x} ${this.position.y} ${this.position.z}`;
                blockLayers[index] = layer;
            }

            block.views = renderBlockViews(blockIndex, block.type, terrain);
            block.views.forEach((v): void => layer.addChild(v));
        },
    );

    // Clear that shit.
    chunk.views.forEach((l): void => void l.removeChildren());

    blockLayers.forEach(
        (graphics, i): void => {
            let layer = null;
            if (this.layers[i]) {
                layer = this.layers[i];
            } else {
                layer = new PIXI.Container();
                layer.sortableChildren = false;
                // layer.cacheAsBitmap = true;
                layer.zIndex = i;
                layer.position.set(this.position.x, this.position.y);
                layer.name = `ChunkLayer: ${this.position.x} ${this.position.y} ${this.position.z}`;
                chunk.views[i] = layer;
                scene.stage.addChild(layer);
            }
            layer.addChild(graphics);
        },
    );
    chunk.hasChanged = false;
}

export function createChunk(id: string, position: Point3D, terrain: Terrain): Chunk {
    return {
        id: id,
        position: position,
        blocks: [],
        blocksToRender: [],
        views: [],
        update: updateChunk,
        setup: (): void => {},
        terrain: terrain,
        hasChanged: true,
    };
}

export const chunkDivider = (size: number) => (point: Point3D) => floorPos(divideBy(size, point));
