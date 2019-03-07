import {BLOCK_SIZE, CHUNK_SIZE} from "./config";
import {Vector3D} from "./types";
import {Chunk, chunkDivider} from "./chunk";
import {GameObject} from "./game-object";
import {addPos} from "./utils/position";
import * as PIXI from "pixi.js";
import {createLineGraphic} from "./utils/graphics";
import {BlockIndex, ChunkIndex, Position} from "./position";

export enum BlockType {
    AIR = "air",
    ROCK = "rock",
    GRASS = "grass",
    VOID = "void"
}

export class Block extends Position {

    get drawX(): number {
        return this.x;
    }

    get drawY(): number {
        return this.y - this.z + BLOCK_SIZE * CHUNK_SIZE;
    }

    transparent = false;
    updated = false;
    worldIndex: BlockIndex = null;
    chunkIndex: ChunkIndex = null;

    private views: PIXI.DisplayObject[] = [];

    constructor(
        readonly type: BlockType,
        public vector3D: Vector3D
    ) {
        super(vector3D);
        this.transparent = this.type === BlockType.AIR;

        this.updated = true;

        this.worldIndex = new BlockIndex(this);
        this.chunkIndex = new ChunkIndex(this);
    }

    update(delta: number) {

    }

    getViews(): PIXI.DisplayObject[] {
        return this.views;
    }

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
        const drawX = this.drawX - chunk.x;
        const drawY = this.drawY - chunk.y;

        const neighbors = {
            front: !chunk.isEmpty(addPos(this.worldIndex.point, [0, 1, 0]))
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
        const drawX = this.drawX - chunk.x;
        const drawY = this.drawY - chunk.y;

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
        const drawX = this.drawX - chunk.x;
        const drawY = this.drawY - chunk.y;

        const neighbors = {
            left:         !chunk.isEmpty(addPos(this.worldIndex.point, [-1, 0, 0])),
            right:        !chunk.isEmpty(addPos(this.worldIndex.point, [1, 0, 0])),
            front:        !chunk.isEmpty(addPos(this.worldIndex.point, [0, 1, 0])),
            top:          !chunk.isEmpty(addPos(this.worldIndex.point, [0, 0, 1])),
            back:         !chunk.isEmpty(addPos(this.worldIndex.point, [0, -1, 0])),
            frontBottom:  !chunk.isEmpty(addPos(this.worldIndex.point, [0, 1, -1])),
            bottom:       !chunk.isEmpty(addPos(this.worldIndex.point, [0, 0, -1]))
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
