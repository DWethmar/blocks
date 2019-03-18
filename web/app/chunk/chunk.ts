import * as PIXI from "pixi.js";
import {GameObject} from "../game-object/game-object";
import {Block} from "../block/block";
import {BlockIndex} from "../position/block-index";
import {ChunkIndex} from "../position/chunk-index";
import {Terrain} from "../terrain/terrain";
import {Point3D} from "../position/point";
import {BLOCK_SIZE, CHUNK_SIZE} from "../config";
import {divideBy} from "../calc/calc";
import {getVisibleBlocks} from "./chunk-utils";
import {sortZYXAsc} from "../calc/sort";
import {getBlockId} from "../block/block-utils";

export class Chunk extends GameObject {

    readonly blocks: Map<string, Block> = new Map<string, Block>();

    public blocksToRender: string[] = [];
    public hasChanged = false;
    public bounds: PIXI.Rectangle;
    public blockIndex: BlockIndex = null;
    public chunkIndex: ChunkIndex = null;

    /**
     * layers are the cross-section of a chunk on the Y axis (back to front).
     */
    private layers: PIXI.Container[] = [];

    constructor(
        readonly id: string,
        readonly stage: PIXI.Container,
        readonly terrain: Terrain,
        readonly vector3D: Point3D
    ) {
        super(id, vector3D);

        this.chunkIndex = new ChunkIndex(this.position);
        this.blockIndex = new BlockIndex(this.position);

        this.bounds = new PIXI.Rectangle(
            this.position.x,
            this.position.y,
            CHUNK_SIZE * BLOCK_SIZE,
            CHUNK_SIZE * BLOCK_SIZE * 2
        );
    }

    public show() {
        this.layers.forEach(l => l.visible = true);
    }

    public hide() {
        this.layers.forEach(l => l.visible = false);
    }

    update(delta: number) {
        if (!this.hasChanged) {
            return;
        }

        console.log(`Updating chunk: ${ this.id }`);

        this.blocksToRender = getVisibleBlocks(this);

        // Sort
        this.blocksToRender.sort((idA, idB) => {
            return sortZYXAsc(
                this.blocks.get(idA).position.point,
                this.blocks.get(idB).position.point
            );
        });

        const blockLayers: PIXI.Container[] = [];

        this.blocksToRender.forEach(id => {
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
        });

        // Clear that shit.
        this.layers.forEach(l => l.removeChildren());

        blockLayers.forEach((graphics, i) => {
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
        });

        this.hasChanged = false;
    }

    isEmpty(position: Point3D): boolean {
        const block = this.getBlock(position);
        return !block || (!!block && block.transparent);
    }

    getBlock(worldPosition: Point3D): Block | null {
        return this.blocks.get(getBlockId(worldPosition)) || null;
    }

    addBlock(block: Block): Block {
        this.blocks.set(getBlockId(block.blockIndex.point), block);
        this.hasChanged = true;
        return block;
    }

    removeBlock(position: Point3D): Block {
        this.hasChanged = true;
        const block = this.getBlock(position);
        this.blocks.delete(getBlockId(position));
        return block;
    }

    getCenter(): PIXI.Point {
        return new PIXI.Point(
            this.position.x + (CHUNK_SIZE * BLOCK_SIZE) / 2,
            this.position.y - this.position.z + (CHUNK_SIZE * BLOCK_SIZE) / 2
        );
    }
}

export const chunkDivider = (size: number) => (i: number[]) =>
    divideBy(size, i).map(i => Math.floor(i));
