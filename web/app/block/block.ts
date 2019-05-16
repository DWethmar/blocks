import * as PIXI from 'pixi.js';

import { GameObject } from '../game-object/game-object';
import { BLOCK_SIZE, CHUNK_SIZE } from '../config';
import { BlockIndex } from '../position/block-index';
import { ChunkIndex } from '../position/chunk-index';
import { BlockType } from './block-type';
import { Point3D, createPoint } from '../position/point';
import { Chunk } from '../chunk/chunk';
import { addPos } from '../position/point-utils';
import { createLineGraphic } from '../graphics/line';

export class Block extends GameObject {
    public get drawX(): number {
        return this.position.x;
    }

    public get drawY(): number {
        return this.position.y - this.position.z + BLOCK_SIZE * CHUNK_SIZE;
    }

    public transparent = false;
    public blockIndex: BlockIndex = null;
    public chunkIndex: ChunkIndex = null;
    public type: BlockType;
    private views: PIXI.DisplayObject[] = [];

    public constructor(type: BlockType, vector3D: Point3D) {
        super('', vector3D);
        this.type = type;
        this.blockIndex = new BlockIndex(this.position);
        this.chunkIndex = new ChunkIndex(this.position);
        this.transparent = this.type === BlockType.AIR;
    }

    public getViews(): PIXI.DisplayObject[] {
        return this.views;
    }

    public update(delta: number): void {}

    public renderViews(chunk: Chunk): void {
        if (this.views.length) {
            this.views.forEach(v => v.destroy());
            this.views = [];
        }
        this.renderTop(chunk);
        this.renderBottom(chunk);
        this.renderBlockOutline(chunk);
    }

    private renderTop(chunk: Chunk): void {
        const drawX = this.drawX - chunk.position.x;
        const drawY = this.drawY - chunk.position.y;

        const neighbors = {
            front: !chunk.isEmpty(addPos(this.blockIndex.point, createPoint(0, 1, 0))),
        };

        if (!neighbors.front) {
            let frontColor = null;
            // Front
            switch (this.type) {
                case BlockType.ROCK:
                    frontColor = 0x5a5a5a;
                    break;
                case BlockType.GRASS:
                    frontColor = 0x795128;
                    break;
                case BlockType.SELECTION:
                    frontColor = 0xff4d4d;
                    break;
                default:
                    frontColor = 0x9e34a1;
                    break;
            }
            const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
            sprite.tint = frontColor;
            sprite.width = sprite.height = BLOCK_SIZE;
            sprite.position.set(drawX, drawY);
            this.views.push(sprite);
        }
    }

    private renderBottom(chunk: Chunk): void {
        const drawX = this.drawX - chunk.position.x;
        const drawY = this.drawY - chunk.position.y;

        let topColor = null;
        // Top
        switch (this.type) {
            case BlockType.ROCK:
                topColor = 0xa5a5a5;
                break;
            case BlockType.GRASS:
                topColor = 0x008000;
                break;
            case BlockType.SELECTION:
                topColor = 0xe60000;
                break;
            default:
                topColor = 0xff00d1;
                break;
        }
        const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        sprite.tint = topColor;
        sprite.width = sprite.height = BLOCK_SIZE;
        sprite.position.set(drawX, drawY - BLOCK_SIZE);
        this.views.push(sprite);
    }

    private renderBlockOutline(chunk: Chunk): void {
        const drawX = this.drawX - chunk.position.x;
        const drawY = this.drawY - chunk.position.y;

        const neighbors = {
            left: !chunk.isEmpty(addPos(this.blockIndex.point, createPoint(-1, 0, 0))),
            right: !chunk.isEmpty(addPos(this.blockIndex.point, createPoint(1, 0, 0))),
            front: !chunk.isEmpty(addPos(this.blockIndex.point, createPoint(0, 1, 0))),
            top: !chunk.isEmpty(addPos(this.blockIndex.point, createPoint(0, 0, 1))),
            back: !chunk.isEmpty(addPos(this.blockIndex.point, createPoint(0, -1, 0))),
            frontBottom: !chunk.isEmpty(addPos(this.blockIndex.point, createPoint(0, 1, -1))),
            bottom: !chunk.isEmpty(addPos(this.blockIndex.point, createPoint(0, 0, -1))),
        };

        const linesContainer = new PIXI.Container();

        const lineColor = 0x000000;
        const lines = [];
        if (!neighbors.top) {
            if (!neighbors.left) {
                lines.push(createLineGraphic(drawX, drawY - BLOCK_SIZE, 0, 0, 0, BLOCK_SIZE, lineColor));
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

            if (!neighbors.bottom && !neighbors.front) {
                lines.push(createLineGraphic(drawX, drawY + BLOCK_SIZE, 0, 0, BLOCK_SIZE, 0, lineColor));
            }
        }
        lines.forEach((l): void => void linesContainer.addChild(l));
        this.views.push(linesContainer);
    }
}
