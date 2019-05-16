import * as PIXI from 'pixi.js';

import { GameObject } from '../game-object/game-object';
import { Block } from '../block/block';
import { BlockIndex } from '../position/block-index';
import { ChunkIndex } from '../position/chunk-index';
import { Terrain } from '../terrain/terrain';
import { Point3D } from '../position/point';
import { BLOCK_SIZE, CHUNK_SIZE } from '../config';
import { divideBy } from '../calc/calc';
import { getVisibleBlocks } from './chunk-utils';
import { sortZYXAsc } from '../calc/sort';
import { getBlockId } from '../block/block-utils';
import { floorPos } from '../position/point-utils';

export class Chunk extends GameObject {
    public readonly blocks: Map<string, Block> = new Map<string, Block>();

    public readonly stage: PIXI.Container;
    public readonly terrain: Terrain;
    public readonly vector3D: Point3D;

    public blocksToRender: string[] = [];
    public hasChanged = false;
    public bounds: PIXI.Rectangle;
    public blockIndex: BlockIndex = null;
    public chunkIndex: ChunkIndex = null;

    /**
     * layers are the cross-section of a chunk on the Y axis (back to front).
     */
    private layers: PIXI.Container[] = [];

    public constructor(id: string, stage: PIXI.Container, terrain: Terrain, position: Point3D) {
        super(id, position);

        this.stage = stage;
        this.terrain = terrain;

        this.chunkIndex = new ChunkIndex(this.position);
        this.blockIndex = new BlockIndex(this.position);

        this.bounds = new PIXI.Rectangle(
            this.position.x,
            this.position.y,
            CHUNK_SIZE * BLOCK_SIZE,
            CHUNK_SIZE * BLOCK_SIZE * 2,
        );
    }

    public show(): void {
        this.layers.forEach((l): void => void (l.visible = true));
    }

    public hide(): void {
        this.layers.forEach((l): void => void (l.visible = false));
    }

    public update(delta: number): void {
        if (!this.hasChanged) {
            return;
        }

        console.log(`Updating chunk: ${this.id}`);

        this.blocksToRender = getVisibleBlocks(this);

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

    public isEmpty(position: Point3D): boolean {
        const block = this.getBlock(position);
        return !block || (!!block && block.transparent);
    }

    public getBlock(worldPosition: Point3D): Block | null {
        return this.blocks.get(getBlockId(worldPosition)) || null;
    }

    public addBlock(block: Block): Block {
        this.blocks.set(getBlockId(block.blockIndex.point), block);
        this.hasChanged = true;
        return block;
    }

    public removeBlock(position: Point3D): Block {
        this.hasChanged = true;
        const block = this.getBlock(position);
        this.blocks.delete(getBlockId(position));
        return block;
    }

    public getCenter(): PIXI.Point {
        return new PIXI.Point(
            this.position.x + (CHUNK_SIZE * BLOCK_SIZE) / 2,
            this.position.y - this.position.z + (CHUNK_SIZE * BLOCK_SIZE) / 2,
        );
    }
}

export const chunkDivider = (size: number) => (point: Point3D) => floorPos(divideBy(size, point));
