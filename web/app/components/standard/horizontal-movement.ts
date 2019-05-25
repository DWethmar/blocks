import * as PIXI from 'pixi.js';

import { Scene } from '../../../../packages/core/src/scene/scene';
import { GameObject } from '../../../../packages/core/src/game-object/game-object';
import { createPoint } from '../../../../packages/core/src/position/point';
import { addPos } from '../../../../packages/core/src/position/point-utils';
import { BLOCK_SIZE, CHUNK_SIZE } from '../../config';

export function horizontalMovement(scene: Scene, gameObject: GameObject): void {
    if (!(gameObject as any).horizontalMovement) {
        (gameObject as any).horizontalMovement = {};
        (gameObject as any).horizontalMovement.current = createPoint();
        (gameObject as any).horizontalMovement.start = createPoint();
        (gameObject as any).horizontalMovement.right = true;
    }
    const current = (gameObject as any).horizontalMovement.current;
    const start = (gameObject as any).horizontalMovement.start;
    const right = (gameObject as any).horizontalMovement.right;

    if (current.x > start.x + BLOCK_SIZE * CHUNK_SIZE && right) {
        (gameObject as any).horizontalMovement.right = false;
    } else {
        if (current.x < start.x && !right) {
            (gameObject as any).horizontalMovement.right = true;
        }
    }

    if (right) {
        current.x += 2 * scene.delta;
    } else {
        current.x -= 2 * scene.delta;
    }

    gameObject.position = addPos(gameObject.position, current);
}
