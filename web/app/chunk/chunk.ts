import * as PIXI from "pixi.js";
import {GameObject} from "../game-object/game-object";
import {Block} from "../block/block";
import {BlockIndex} from "../position/block-index";
import {ChunkIndex} from "../position/chunk-index";
import {Terrain} from "../terrain/terrain";
import {Point3D} from "../position/point";
import {BLOCK_SIZE, CHUNK_SIZE} from "../config";
import {divideBy} from "../calc/calc";
import {addPos, minusPos} from "../position/point-utils";
import {BlockType} from "../block/block-type";
import {getVisibleBlocks, isPositionWithinChunk} from "./chunk-utils";
import {sortZYXAsc} from "../calc/sort";
import {getBlockId} from "../block/block-utils";
import {Position} from "../position/position";

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
        let y = p.y;
        let z = 0;

        const lowerHalve = p.y > this.bounds.height / 2;

        console.log('CLICKED', x, y, lowerHalve);

        const position = new Position(<Point3D>[
            x,
            y,
            this.position.z + (CHUNK_SIZE * BLOCK_SIZE)
        ]);
        const blockIndex = new BlockIndex(position);

        const hit: Block = this.raycast(blockIndex.point, [0, -1, -1]);

        if (hit) {
            this.addBlock(
                new Block(BlockType.VOID, <Point3D>hit.position.point)
            );
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

    raycast(start: Point3D, direction: Point3D): Block | null {
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
