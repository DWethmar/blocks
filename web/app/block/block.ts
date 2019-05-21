import * as PIXI from 'pixi.js';

import { GameObject } from '../game-object/game-object';
import { BlockType } from './block-type';
import { Point3D } from '../position/point';

export function isBlockTransparent(type: BlockType): boolean {
    return type === BlockType.AIR;
}

export interface Block extends GameObject {
    type: BlockType;
    views: PIXI.Container[];
    transparent: boolean;
}

export function createBlock(
    id: string,
    position: Point3D,
    type: BlockType,
): Block {
    return {
        id: id,
        position: position,
        transparent: isBlockTransparent(type),
        type: type,
        views: [],
        components: [],
    };
}
