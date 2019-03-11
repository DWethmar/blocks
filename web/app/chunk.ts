import * as PIXI from "pixi.js";

import {BLOCK_SIZE, CHUNK_SIZE} from "./config";
import {divideBy} from "./utils/calc";
import {Vector3D} from "./types";
import {Block, BlockType} from "./block";
import {GameObject} from "./game-object";
import {sortZYXAsc} from "./utils/sort";
import {getBlockId} from "./utils/id";
import {getVisibleBlocks} from "./utils/chunk";
import {Terrain} from "./terrain";
import {addPos} from "./utils/position";
import {BlockIndex, ChunkIndex} from "./position";

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
        readonly vector3D: Vector3D
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

        const rect = new PIXI.Graphics();
        rect.lineStyle(1, 0x000);

        rect.interactive = true;
        rect.hitArea = this.bounds;
        rect.renderable = false;

        rect.on("click", (event: any) =>
            this.click(event.data.getLocalPosition(rect))
        );

        stage.addChild(rect);
    }

    public show() {
        this.layers.forEach(l => l.visible = true);
    }

    public hide() {
        this.layers.forEach(l => l.visible = false);
    }

    private click(p: PIXI.Point) {
        const x = p.x;
        let y = 0;
        let z = 0;

        if (p.y > this.bounds.height / 2) {
            // click on front
            z = ((CHUNK_SIZE * BLOCK_SIZE) * 2) - p.y;
            y = CHUNK_SIZE * BLOCK_SIZE;
        } else {
            z = (CHUNK_SIZE * BLOCK_SIZE); // click on ceil
            y = ((CHUNK_SIZE * BLOCK_SIZE) * 2) - p.y
        }

        const worldPos = <Vector3D>(
            divideBy(BLOCK_SIZE, [x, y, z]).map(i => Math.floor(i))
        );

        const dir = <Vector3D>[0, -1, -1];
        const hit = this.raycast(addPos(worldPos, dir), dir);

        if (hit) {
            const nb = this.addBlock(
                new Block(BlockType.VOID, addPos(hit.vector3D, [0, 0, BLOCK_SIZE])));
            console.log(nb);
        }
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
                this.blocks.get(idA).position.vector3D,
                this.blocks.get(idB).position.vector3D
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

    isEmpty(position: Vector3D): boolean {
        const block = this.getBlock(position);
        return !block || (!!block && block.transparent);
    }

    getBlock(worldPosition: Vector3D): Block | null {
        return this.blocks.get(getBlockId(worldPosition)) || null;
    }

    addBlock(block: Block): Block {
        this.blocks.set(getBlockId(block.blockIndex.point), block);
        this.hasChanged = true;
        return block;
    }

    removeBlock(position: Vector3D): Block {
        this.hasChanged = true;
        const block = this.getBlock(position);
        this.blocks.delete(getBlockId(position));
        return block;
    }

    raycast(start: Vector3D, direction: Vector3D): Block | null {
        const block = this.getBlock(start);

        if (block) {
            if (block.type !== BlockType.AIR) {
                return block;
            }
        } else {
            return null;
        }

        return this.raycast(addPos(start, direction), direction);
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
