import * as PIXI from 'pixi.js';

import { GameObject } from '../game-object/game-object';
import { BLOCK_SIZE, CHUNK_SIZE } from '../config';
import { BlockType } from './block-type';
import { Point3D, createPoint } from '../position/point';
import { Chunk } from '../chunk/chunk';
import { addPos, convertPositionToBlockIndex, convertBlockIndexToLocalChunkIndex } from '../position/point-utils';
import { createLineGraphic } from '../graphics/line';
import { Terrain } from '../terrain/terrain';
import { Scene } from '../scene/scene';

export function isBlockTransparent(block: Block): boolean {
    return block.type === BlockType.AIR;
}

export interface Block extends GameObject {
    type: BlockType;
    views: PIXI.Container[];
}

function renderTop(blockIndex: Point3D, localIndex: Point3D, type: BlockType, terrain: Terrain): PIXI.DisplayObject {
    const drawX = localIndex.x * BLOCK_SIZE;
    const drawY = localIndex.y * BLOCK_SIZE;

    const neighbors = {
        front: terrain.getBlock(addPos(blockIndex, createPoint(0, 1, 0))),
    };

    if (!neighbors.front) {
        let frontColor = null;
        // Front
        switch (type) {
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
        return sprite;
    }
}

function renderBottom(blockIndex: Point3D, localIndex: Point3D,  type: BlockType): PIXI.DisplayObject {
    const drawX = localIndex.x * BLOCK_SIZE;
    const drawY = localIndex.y * BLOCK_SIZE;

    let topColor = null;
    // Top
    switch (type) {
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
    return sprite;
}

function renderBlockOutline(blockIndex: Point3D, localIndex: Point3D, type: BlockType, terrain: Terrain): PIXI.DisplayObject {
    const drawX = localIndex.x * BLOCK_SIZE;
    const drawY = localIndex.y * BLOCK_SIZE;

    const neighbors = {
        left: !terrain.getBlock(addPos(blockIndex, createPoint(-1, 0, 0))),
        right: !terrain.getBlock(addPos(blockIndex, createPoint(1, 0, 0))),
        front: !terrain.getBlock(addPos(blockIndex, createPoint(0, 1, 0))),
        top: !terrain.getBlock(addPos(blockIndex, createPoint(0, 0, 1))),
        back: !terrain.getBlock(addPos(blockIndex, createPoint(0, -1, 0))),
        frontBottom: !terrain.getBlock(addPos(blockIndex, createPoint(0, 1, -1))),
        bottom: !terrain.getBlock(addPos(blockIndex, createPoint(0, 0, -1))),
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
    return linesContainer;
}

export function renderBlockViews(position: Point3D, type: BlockType, terrain: Terrain): PIXI.Container[] {
    const views = [];

    const blockIndex = convertPositionToBlockIndex(position);
    const localIndex = convertBlockIndexToLocalChunkIndex(blockIndex);

    views.push(renderTop(blockIndex, localIndex, type, terrain));
    views.push(renderBottom(blockIndex, localIndex, type));
    views.push(renderBlockOutline(blockIndex, localIndex, type, terrain));
    return views.filter(x => !!x);
}

export function createBlock(id: string, position: Point3D, type: BlockType): Block {
    return {
        id: id,
        position: position,
        type: type,
        views: [],
        components: []
    };
}
