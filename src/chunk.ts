import * as PIXI from "pixi.js";

import {BLOCK_SIZE, CHUNK_SIZE} from "./config";
import {divideBy} from "./utils/calc";
import {Vector3D} from "./types";
import {Block, BlockType} from "./block";
import {addPos} from "./utils/position";
import {GameObject} from "./game-object";
import {sortZYXAsc} from "./utils/sort";
import {getBlockId} from "./utils/id";
import {getVisibleBlocks, isPositionWithinChunk} from "./utils/chunk";
import {Terrain} from "./terrain";

export class Chunk extends GameObject {

    readonly blocks: Map<string, Block> = new Map<string, Block>();

    public blocksToRender: string[] = [];
    public hasChanged = false;
    public bounds: PIXI.Rectangle;

    /**
     * layers are the cross-section of a chunk on the Y axis (back to front).
     */
    private layers: PIXI.Container[] = [];

    constructor(
        readonly stage: PIXI.Container,
        readonly terrain: Terrain,
        readonly vector3D: Vector3D
    ) {
        super(vector3D);

        this.bounds = new PIXI.Rectangle(
            this.x,
            this.y,
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
            const blockPos = hit.position.vector3D;
            const nb = this.createBlock(
                addPos(blockPos, [0, 0, BLOCK_SIZE]),
                BlockType.VOID
            );
            console.log(nb);
        }
    }

    update(delta: number) {
        if (!this.hasChanged) {
            return;
        }

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

            const index = block.y;
            let layer = null;

            if (blockLayers[index]) {
                layer = blockLayers[index];
            } else {
                layer = new PIXI.Container();
                layer.sortableChildren = false;
                layer.name = `BlockLayer: ${this.x} ${this.y} ${this.z}`;
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
                layer.position.set(this.x, this.y);
                layer.name = `ChunkLayer: ${this.x} ${this.y} ${this.z}`;
                this.layers[i] = layer;
                this.stage.addChild(layer);
            }

            // let img = new PIXI.Sprite(graphics.generateCanvasTexture());
            // img.position.set(graphics.x, (layer.zIndex) + (BLOCK_SIZE * CHUNK_SIZE) - graphics.height);
            // img.width = graphics.width;
            // img.height = graphics.height;
            //
            // console.log(graphics.position);

            layer.addChild(graphics);
        });

        this.hasChanged = false;
    }

    isEmpty(position: Vector3D): boolean {
        const block = this.getBlock(position);
        return block ? block.transparent : true;
    }

    getBlock(worldPosition: Vector3D): Block | null {
        if (isPositionWithinChunk(worldPosition, this)) {
            return this.blocks.has(getBlockId(worldPosition))
                ? this.blocks.get(getBlockId(worldPosition))
                : new Block(BlockType.AIR, worldPosition);
        }
        const otherChunk = this.terrain.getChunk(<Vector3D>chunkDivider(CHUNK_SIZE)(worldPosition));
        return otherChunk ? otherChunk.getBlock(worldPosition) : null;
    }

    createBlock(position: Vector3D, type: BlockType): Block {
        const block = new Block(type, position);
        this.blocks.set(getBlockId(block.blockIndex.point), block);
        this.hasChanged = true;

        this.terrain.triggerSurroundingChunk(this.chunkIndex.point, block.chunkIndex.point);

        return block;
    }

    deleteBlock(position: Vector3D): Block {
        const block = this.getBlock(position);
        if (block) {
            this.blocks.delete(getBlockId(position));
        }
        this.hasChanged = true;
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
            this.x + (CHUNK_SIZE * BLOCK_SIZE) / 2,
            this.y - this.z + (CHUNK_SIZE * BLOCK_SIZE) / 2
        );
    }
}

export const chunkDivider = (size: number) => (i: number[]) =>
    divideBy(size, i).map(i => Math.floor(i));
