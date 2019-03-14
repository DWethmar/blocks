import {BLOCK_SIZE, CHUNK_SIZE} from "./config";
import {Point3D} from "./types";
import {Chunk} from "./chunk";
import {addPos} from "./utils/position";
import * as PIXI from "pixi.js";
import {createLineGraphic} from "./utils/graphics";
import {BlockIndex, ChunkIndex} from "./position";
import {GameObject} from "./game-object";

export enum BlockType {
    AIR = "air",
    ROCK = "rock",
    GRASS = "grass",
    VOID = "void"
}

export class Block extends GameObject {

    get drawX(): number {
        return this.position.x;
    }

    get drawY(): number {
        return this.position.y - this.position.z + BLOCK_SIZE * CHUNK_SIZE;
    }

    transparent = false;
    blockIndex: BlockIndex = null;
    chunkIndex: ChunkIndex = null;

    private views: PIXI.DisplayObject[] = [];

    constructor(
        readonly type: BlockType,
        public vector3D: Point3D
    ) {
        super('', vector3D);
        this.blockIndex = new BlockIndex(this.position);
        this.chunkIndex = new ChunkIndex(this.position);
        this.transparent = this.type === BlockType.AIR;
    }

    getViews(): PIXI.DisplayObject[] {
        return this.views;
    }

    update(delta: number) {}

    renderViews(chunk: Chunk) {
        if (this.views.length) {
            this.views.forEach(v => v.destroy());
            this.views = [];
        }
        this.renderTop(chunk);
        this.renderBottom(chunk);
        this.renderBlockOutline(chunk);
    }

    private renderTop(chunk: Chunk) {
        const drawX = this.drawX - chunk.position.x;
        const drawY = this.drawY - chunk.position.y;

        const neighbors = {
            front: !chunk.isEmpty(addPos(this.blockIndex.point, [0, 1, 0]))
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

    private renderBottom(chunk: Chunk) {
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

    private renderBlockOutline(chunk: Chunk) {
        const drawX = this.drawX - chunk.position.x;
        const drawY = this.drawY - chunk.position.y;

        const neighbors = {
            left:         !chunk.isEmpty(addPos(this.blockIndex.point, [-1, 0, 0])),
            right:        !chunk.isEmpty(addPos(this.blockIndex.point, [1, 0, 0])),
            front:        !chunk.isEmpty(addPos(this.blockIndex.point, [0, 1, 0])),
            top:          !chunk.isEmpty(addPos(this.blockIndex.point, [0, 0, 1])),
            back:         !chunk.isEmpty(addPos(this.blockIndex.point, [0, -1, 0])),
            frontBottom:  !chunk.isEmpty(addPos(this.blockIndex.point, [0, 1, -1])),
            bottom:       !chunk.isEmpty(addPos(this.blockIndex.point, [0, 0, -1]))
        };

        const linesContainer = new PIXI.Container();

        const lineColor = 0x000000;
        const lines = [];
        if (!neighbors.top) {
            if (!neighbors.left) {
                lines.push(
                    createLineGraphic(
                        drawX,
                        drawY - BLOCK_SIZE,
                        0,
                        0,
                        0,
                        BLOCK_SIZE,
                        lineColor
                    )
                );
            }

            if (!neighbors.right) {
                lines.push(
                    createLineGraphic(
                        drawX + BLOCK_SIZE,
                        drawY - BLOCK_SIZE,
                        0,
                        0,
                        0,
                        BLOCK_SIZE,
                        lineColor
                    )
                );
            }

            if (!neighbors.back) {
                lines.push(
                    createLineGraphic(
                        drawX,
                        drawY - BLOCK_SIZE,
                        0,
                        0,
                        BLOCK_SIZE,
                        0,
                        lineColor
                    )
                );
            }
        }

        if (!neighbors.front) {
            if (!neighbors.left) {
                lines.push(
                    createLineGraphic(
                        drawX,
                        drawY,
                        0,
                        0,
                        0,
                        BLOCK_SIZE,
                        lineColor
                    )
                );
            }

            if (!neighbors.right) {
                lines.push(
                    createLineGraphic(
                        drawX + BLOCK_SIZE,
                        drawY,
                        0,
                        0,
                        0,
                        BLOCK_SIZE,
                        lineColor
                    )
                );
            }

            if (!neighbors.bottom && !neighbors.front) {
                lines.push(
                    createLineGraphic(
                        drawX,
                        drawY + BLOCK_SIZE,
                        0,
                        0,
                        BLOCK_SIZE,
                        0,
                        lineColor
                    )
                );
            }
        }
        lines.forEach(l => linesContainer.addChild(l));
        this.views.push(linesContainer);
    };
}
