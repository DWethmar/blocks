import * as PIXI from 'pixi.js';

import {BLOCK_SIZE, CHUNK_SIZE} from './config';
import {divideBy} from './utils/calc';
import {chunkSelector, Vector3D} from './types';
import {Block, BlockType} from './block';
import {addPos, getPointsBetween, getY, getZ, isWithin, minusPos, positionId} from './utils/position';
import {GameObject} from './game-object';
import {sortZYX} from './utils/sort';
import {LightenDarkenColor} from './utils/color';
import Container = PIXI.Container;

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

    private layers: PIXI.Container[] = [];

    constructor(
        readonly stage: PIXI.Container,
        readonly renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer,
        readonly chunkSelector: chunkSelector,
        readonly position: Vector3D
    ) {
        super(position);

        // Debug
        // const graphics = new PIXI.Graphics();
        // graphics.beginFill(0x9E34A1);
        // graphics.drawRect(this.x, this.y, BLOCK_SIZE * CHUNK_SIZE, BLOCK_SIZE * CHUNK_SIZE * 2);
        //
        // this.stage.addChild(graphics);

        const pixiCircle = new PIXI.Graphics();
        pixiCircle.lineStyle(2, 0xFF00FF);  //(thickness, color)
        pixiCircle.drawCircle(this.x, this.y, 10);   //(x,y,radius)
        pixiCircle.endFill();
        (<any>pixiCircle).zIndex = getY(this.worldPosition);
        stage.addChild(pixiCircle);
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

        const preLayers: PIXI.Container[] = [];

        this.blocksToRender.forEach(id => {
            const block = this.blocks.get(id);

            const layerIndex = getY(block.worldPosition);

            let layer = null;

            if (preLayers[layerIndex]) {
                layer = preLayers[layerIndex];
            } else {
                layer = new PIXI.Container();
                layer.cacheAsBitmap = true;

                layer.name = positionId(this.chunkPosition) + '-' + layerIndex;
                layer.zIndex = getZ(this.worldPosition) - getY(this.worldPosition) + layerIndex;

                // layer.position.x = this.x ^ this.y;
                // layer.position.y = this.y;

                layer.width = CHUNK_SIZE * BLOCK_SIZE;
                layer.height =  CHUNK_SIZE * 2 * BLOCK_SIZE;

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
                lines.push(this.drawLine(drawX, drawY - BLOCK_SIZE, 0, 0, 0, BLOCK_SIZE, lineColor))
            }

            if (!neighbors.right) {
                lines.push(this.drawLine(drawX + BLOCK_SIZE, drawY - BLOCK_SIZE, 0, 0, 0, BLOCK_SIZE, lineColor));
            }

            if (!neighbors.back) {
                lines.push(this.drawLine(drawX, drawY - BLOCK_SIZE, 0, 0, BLOCK_SIZE, 0, lineColor));
            }
        }

        if (!neighbors.front) {
            if (!neighbors.left) {
                lines.push(this.drawLine(drawX, drawY, 0, 0, 0, BLOCK_SIZE, lineColor));
            }

            if (!neighbors.right) {
                lines.push(this.drawLine(drawX + BLOCK_SIZE, drawY, 0, 0, 0, BLOCK_SIZE, lineColor));
            }

            if (neighbors.frontBottom || !neighbors.bottom) {
                lines.push(this.drawLine(drawX, drawY + BLOCK_SIZE, 0, 0, BLOCK_SIZE, 0, lineColor));
            }
        }
        const linesContainer= new PIXI.Container();
        lines.forEach(l => linesContainer.addChild(l));
        container.addChild(linesContainer);
    }

    drawLine(x: number, y: number, xA: number, yA: number, xB: number, yB: number, color: number) {
        const line = new PIXI.Graphics();
        line.lineStyle(2, color, 1);

        // Define line position - this aligns the top left corner of our canvas
        line.position.x = x;
        line.position.y = y;

        // Draw line
        line.moveTo(xA, yA);
        line.lineTo(xB, yB);

        return line;
    }

    getBlock(worldPosition: Vector3D): Block | null {
        if (isPositionWithinChunk(worldPosition, this)) {
            return this.blocks.has(positionId(worldPosition)) ? this.blocks.get(positionId(worldPosition)) : new Block(BlockType.AIR, worldPosition);
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
            }

        });
        console.log(`Amount of visible blocks: ${ this.blocksToRender.length }, for chunk ${ positionId(this.worldPosition) }`, );
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
