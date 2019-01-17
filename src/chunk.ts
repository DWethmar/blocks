import * as PIXI from 'pixi.js';

import {BLOCK_SIZE, CHUNK_SIZE} from './config';
import {divideBy} from './utils/calc';
import {chunkSelector, Vector3D} from './types';
import {Block, BlockType} from './block';
import {addPos, getY, isWithin, minusPos} from './utils/position';
import {GameObject} from './game-object';
import {sortZYX} from './utils/sort';
import {LightenDarkenColor} from './utils/color';
import {createLineGraphic} from './utils/graphics';
import {getBlockId, getChunkId} from "./utils/id";

export class Chunk extends GameObject {

    readonly blocks: Map<string, Block> = new Map<string, Block>();

    public blocksToRender: string[] = [];
    public hasChanged = false;

    get chunkPosition(): Vector3D {
        return  <Vector3D>chunkDivider(CHUNK_SIZE * BLOCK_SIZE)(this.position).map(a => Math.floor(a));
    }

    get worldPosition(): Vector3D {
        return  <Vector3D>chunkDivider(BLOCK_SIZE)(this.position).map(a => Math.floor(a));
    }

    /**
     * layers are the crossection of an chunk on the Y axis (back to front).
     */
    private layers: PIXI.Container[] = [];

    constructor(
        readonly stage: PIXI.Container,
        readonly chunkSelector: chunkSelector,
        readonly position: Vector3D
    ) {
        super(position);

        var rect = new PIXI.Graphics();
        rect.lineStyle(1, 0x000);

        rect.interactive = true;
        rect.hitArea = new PIXI.Rectangle(this.x,this.y, CHUNK_SIZE * BLOCK_SIZE, CHUNK_SIZE * BLOCK_SIZE * 2);

        rect.on('click', (ev: any) => {

            const p = ev.data.getLocalPosition(rect);

            const x = p.x;
            let y = 0;
            let z = 0;

            if (p.y > (CHUNK_SIZE * BLOCK_SIZE)) {          // click on front
                z = (CHUNK_SIZE * BLOCK_SIZE * 2) - p.y;
                y = CHUNK_SIZE * BLOCK_SIZE;
            } else {
                z = (CHUNK_SIZE * BLOCK_SIZE * 2) - p.y;  // click on ceil
                y = CHUNK_SIZE * BLOCK_SIZE;
            }

            const worldPos = <Vector3D>divideBy(BLOCK_SIZE, [x, y, z]).map(i => Math.floor(i));

            const dir = <Vector3D>[0, -1, -1];
            const hit = this.raycast(addPos(worldPos, dir), dir);

            if (hit) {
                const blockPos = <Vector3D>hit.position
                    .map(i => Math.round(i / BLOCK_SIZE))
                    .map(i => i * BLOCK_SIZE);

                const nb = this.createBlock(
                    addPos(
                        blockPos, [0, 0, BLOCK_SIZE]
                    ),
                    BlockType.VOID
                );
                console.log(nb);
            }
        });

        stage.addChild(rect);
    }

    update(delta: number) {
        if (!this.hasChanged) {
            return;
        }

        this.calculateVisibleBlocks();

        // Sort
        this.blocksToRender.sort(((idA, idB) => {
            return sortZYX(this.blocks.get(idA).position, this.blocks.get(idB).position);
        }));

        const preLayers: PIXI.Container[] = [];

        this.blocksToRender.forEach(id => {
            const block = this.blocks.get(id);

            const layerIndex = block.y;

            let layer = null;

            if (preLayers[layerIndex]) {
                layer = preLayers[layerIndex];
            } else {
                layer = new PIXI.Container();
                layer.cacheAsBitmap = true;
                layer.zIndex = Math.floor(layerIndex);
                layer.name = getChunkId(this.chunkPosition) + '-' + layerIndex;
                preLayers[layerIndex] = layer;
            }
            this.renderBlock(block, layer);
            this.renderLines(block, layer);
        });

        // Clear that shit.
        this.layers.forEach(l => l.removeChildren());

        preLayers.forEach((preLayer, i) => {
            let layer = null;
            if (this.layers[i]) {
                layer = this.layers[i];
            } else {
                layer = new PIXI.Container();
                layer.zIndex = (<any>preLayer).zIndex;
                this.layers[i] = layer;
                this.stage.addChild(layer);
            }
            layer.addChild(preLayer);
        });

        this.hasChanged = false;
    }


    private renderBlock(block: Block, container: PIXI.Container) {
        const graphics = new PIXI.Graphics();
        let lighten = 0;

        const drawX = block.x - this.x;
        const drawY = (block.y - block.z) + (BLOCK_SIZE * CHUNK_SIZE) - this.y;

        const neighbors = {
            front: !this.isEmpty(addPos(block.worldPosition, [0, 1, 0])),
        };

        if (!neighbors.front) {
            let frontColor = null;
            // Front
            switch (block.type) {
                case BlockType.ROCK:
                    frontColor = 0x5A5A5A;
                    break;
                case BlockType.GRASS:
                    frontColor = 0x795128;
                    break;
                default:
                    frontColor = 0x9E34A1;
                    break;
            }
            graphics.beginFill(LightenDarkenColor(frontColor, lighten));
            graphics.drawRect(drawX, drawY, BLOCK_SIZE, BLOCK_SIZE);
        }

        let topColor = null;
        // Top
        switch (block.type) {
            case BlockType.ROCK:
                topColor = 0xA5A5A5;
                break;
            case BlockType.GRASS:
                topColor = 0x008000;
                break;
            default:
                topColor = 0xFF00D1;
                break;
        }
        graphics.beginFill(LightenDarkenColor(topColor, lighten));
        graphics.drawRect(drawX, drawY - BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);


        container.addChild(graphics);
    }

    isEmpty(position: Vector3D): boolean {
        const block = this.getBlock(position);
        return block ? block.transparent : true;
    }

    private renderLines(block: Block, container: PIXI.Container) {

        const drawX = block.x - this.x;
        const drawY = (block.y - block.z) + (BLOCK_SIZE * CHUNK_SIZE) - this.y;

        const neighbors = {
            left:           !this.isEmpty(addPos(block.worldPosition, [-1, 0, 0])),
            right:          !this.isEmpty(addPos(block.worldPosition, [1, 0, 0])),
            front:          !this.isEmpty(addPos(block.worldPosition, [0, 1, 0])),
            top:            !this.isEmpty(addPos(block.worldPosition, [0, 0, 1])),
            back:           !this.isEmpty(addPos(block.worldPosition, [0, -1, 0])),
            frontBottom:    !this.isEmpty(addPos(block.worldPosition, [0, 1, -1])),
            bottom:         !this.isEmpty(addPos(block.worldPosition, [0, 0, -1])),
        };

        const lineColor = 0x000000;
        const lines = [];
        if (!neighbors.top) {
            if (!neighbors.left) {
                lines.push(createLineGraphic(drawX, drawY - BLOCK_SIZE, 0, 0, 0, BLOCK_SIZE, lineColor))
            }

            if (!neighbors.right) {
                lines.push(createLineGraphic(drawX + BLOCK_SIZE, drawY - BLOCK_SIZE, 0, 0, 0, BLOCK_SIZE, lineColor));
            }

            if (!neighbors.back) {
                lines.push(createLineGraphic(drawX, drawY - BLOCK_SIZE, 0, 0, BLOCK_SIZE, 0, lineColor));
            }
        }

        if (!neighbors.front) {
            if (!neighbors.left) {
                lines.push(createLineGraphic(drawX, drawY, 0, 0, 0, BLOCK_SIZE, lineColor));
            }

            if (!neighbors.right) {
                lines.push(createLineGraphic(drawX + BLOCK_SIZE, drawY, 0, 0, 0, BLOCK_SIZE, lineColor));
            }
        }
        const linesContainer= new PIXI.Container();
        lines.forEach(l => linesContainer.addChild(l));
        container.addChild(linesContainer);
    }

    getBlock(worldPosition: Vector3D): Block | null {
        if (isPositionWithinChunk(worldPosition, this)) {
            return this.blocks.has(getBlockId(worldPosition)) ? this.blocks.get(getBlockId(worldPosition)) : new Block(BlockType.AIR, worldPosition);
        }
        const otherChunk = this.chunkSelector(<Vector3D>chunkDivider(CHUNK_SIZE)(worldPosition));
        return otherChunk ? otherChunk.getBlock(worldPosition) : null;
    }

    createBlock(position: Vector3D, type: BlockType): Block {
        const block = new Block(type, position);
        attachBlock(this)(block);
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

    calculateVisibleBlocks() {
        this.blocksToRender = [];
        this.blocks.forEach((b: Block) => {

            if (this.isPosVisible(addPos(b.worldPosition, [0, 1, 1]))) {
                this.blocksToRender.push(getBlockId(b.worldPosition));
            }

        });
        console.log(`Amount of visible blocks: ${ this.blocksToRender.length }, for chunk ${ getChunkId(this.worldPosition) }`, );
    }

    isPosVisible(pos: Vector3D) {
        if (isPositionWithinChunk(pos, this)) {
            const block = this.getBlock(pos);
            if (block && !block.transparent) {
                return false;
            }
            return this.isPosVisible(addPos(pos, [0, 1, 1]));
        }
        return true;
    }

    getCenter(): PIXI.Point {
        return new PIXI.Point(this.x + (CHUNK_SIZE * BLOCK_SIZE) / 2, (this.y - this.z) + (CHUNK_SIZE * BLOCK_SIZE) / 2);
    }
}

export const isPositionWithinChunk = (target: Vector3D, chunk: Chunk) => {
    return isWithin(
        target,
        minusPos(
            chunk.worldPosition, [1, 1, 1]
        ),
        addPos(
            chunk.worldPosition, [CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE]
        )
    );
};

export const createBlockSelector = (chunkSelector) => (selector: Vector3D) => {
    const chunk = chunkSelector(<Vector3D>chunkDivider(CHUNK_SIZE)(selector));
    if (chunk) {
        return chunk.getBlock(selector);
    }
    return null;
};


export const chunkDivider = (size: number) => (i: number[]) => divideBy(size, i).map(i => Math.floor(i));


/**
 * Creates a generator for creating blocks and linking it to a scene.
 *
 * @param scene
 */
const attachBlock = (chunk: Chunk) => (block: Block) => chunk.blocks.set(getBlockId(block.worldPosition), block) ? block : null;
