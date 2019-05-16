import * as PIXI from 'pixi.js';

import { GameObject } from '../game-object/game-object';
import { Block } from '../block/block';
import { Point3D } from '../position/point';
import { CHUNK_SIZE } from '../config';
import { divideBy } from '../calc/calc';
import { getVisibleBlocks } from './chunk-utils';
import { sortZYXAsc } from '../calc/sort';
import { floorPos } from '../position/point-utils';

export function getBlock(point: Point3D, blocks: Block[], chunkSize: number = CHUNK_SIZE): Block {
    return blocks[point.x + chunkSize * (point.y + chunkSize * point.z)];
}

export function setBlock(block: Block, blocks: Block[], chunkSize: number = CHUNK_SIZE): Block[] {
    blocks[block.position.x + chunkSize * (block.position.y + chunkSize * block.position.z)] = block;
    return blocks;
}

export interface Chunk extends GameObject {
    blocks: Block[];
    blocksToRender: string[];
}

export function createChunk(id: string, position: Point3D): Chunk {
    return {
        id: id,
        position: position,
        blocks: [],
        blocksToRender: [],
        views: [],
    };
}

export function updateChunk(chunk: Chunk): void {
    console.log(`Updating chunk: ${this.id}`);

    chunk.blocksToRender = getVisibleBlocks(chunk);

    // Sort
    this.blocksToRender.sort(
        (idA, idB): number => {
            return sortZYXAsc(this.blocks.get(idA).position, this.blocks.get(idB).position);
        },
    );

    const blockLayers: PIXI.Container[] = [];

    this.blocksToRender.forEach(
        (id): void => {
            const block = this.blocks.get(id);

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

            block.renderViews(this);
            block.getViews().forEach(v => layer.addChild(v));
        },
    );

    // Clear that shit.
    this.layers.forEach((l): void => void l.removeChildren());

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
                this.layers[i] = layer;
                this.stage.addChild(layer);
            }
            layer.addChild(graphics);
        },
    );
    this.hasChanged = false;
}

export const chunkDivider = (size: number) => (point: Point3D) => floorPos(divideBy(size, point));
