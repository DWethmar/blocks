import * as PIXI from 'pixi.js';

import {BLOCK_SIZE, CHUNK_SIZE} from './config';
import {divideBy, multiply} from './utils/calc';
import {chunkSelector, Vector3D} from './types';
import {Block, BlockType} from './block';
import {addPos, getPointsBetween, getZ, isWithin, minusPos, positionId} from './utils/position';
import {GameObject} from './game-object';
import {sortZYX} from './utils/sort';
import {LightenDarkenColor} from './utils/color';

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

    chunkGraphics: PIXI.Graphics;

    constructor(
        readonly stage: PIXI.Container,
        readonly chunkSelector: chunkSelector,
        readonly position: Vector3D
    ) {
        super(position);
    }

    update() {
        if (!this.hasChanged) {
            return;
        }

        this.calculateVisibleBlocks();

        // Sort
        this.blocksToRender.sort(((idA, idB) => {
            return sortZYX(this.blocks.get(idA).position, this.blocks.get(idB).position);
        }));

        if (this.chunkGraphics) {
            this.chunkGraphics.clear();
        } else {
            this.chunkGraphics = new PIXI.Graphics();
            this.chunkGraphics.name = positionId(this.chunkPosition);
            this.stage.addChild(this.chunkGraphics);
        }

        this.blocksToRender.forEach(id => {
            const block = this.blocks.get(id);

            let lighten = 0;

            const drawX = block.x - this.stage.x;
            const drawY = (block.y - block.z) + (BLOCK_SIZE * CHUNK_SIZE) - this.stage.y;

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
            this.chunkGraphics.beginFill(LightenDarkenColor(topColor, lighten));
            this.chunkGraphics.drawRect(drawX, drawY - BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

            let bottomColor = null;
            // Bottom
            switch (block.type) {
                case BlockType.ROCK:
                    bottomColor = 0x5A5A5A;
                    break;
                case BlockType.GRASS:
                    bottomColor = 0x795128;
                    break;
                default:
                    bottomColor = 0x9E34A1;
                    break;
            }
            this.chunkGraphics.beginFill(LightenDarkenColor(bottomColor, lighten));
            this.chunkGraphics.drawRect(drawX, drawY, BLOCK_SIZE, BLOCK_SIZE);
        });

        this.hasChanged = false;
    }

    getBlock(worldPosition: Vector3D): Block | null {
        if (isPositionWithinChunk(worldPosition, this)) {
            return this.blocks.has(positionId(worldPosition)) ? this.blocks.get(positionId(worldPosition)) : null;
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

    raycast(start: Vector3D, end: Vector3D): Vector3D {
        if (this.getBlock(start)) {
            return start;
        }
        const p = getPointsBetween(start, end);
        const next = p.next();
        if (next.done) {
            return start;
        } else {
            return this.raycast(next.value, end);
        }
    }

    calculateVisibleBlocks() {
        this.blocksToRender = [];
        this.blocks.forEach((b: Block) => {

            if (this.isPosVisible(addPos(b.worldPosition, [0, 1, 1]))) {
                this.blocksToRender.push(positionId(b.worldPosition));
            } else {
                console.log(':D')
            }

        });
        console.log(`Amount of visible blocks: ${ this.blocksToRender.length }, for chunk ${ positionId(this.worldPosition) }`, );
    }

    isPosVisible(pos: Vector3D) {
        if (isPositionWithinChunk(pos, this)) {
            if (this.getBlock(pos)) {
                return false;
            }
            return this.isPosVisible(addPos(pos, [0, 1, 1]));
        }
        return true;
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
const attachBlock = (chunk: Chunk) => (block: Block) => chunk.blocks.set(positionId(block.worldPosition), block) ? block : null;
