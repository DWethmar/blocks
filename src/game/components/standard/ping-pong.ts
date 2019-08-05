import * as PIXI from 'pixi.js';
import { GameObject } from '../../engine/game-object';
import { GameScene } from '../../scene/game-scene';
import { Point3D, createPoint } from '../../position/point';
import { addPos } from '../../position/point-utils';

const left = 0;
const right = 100;
const start = 'ping';

interface HorizontalMovementData {
    start: Point3D;
    left: Point3D;
    right: Point3D;
    goLeft: boolean;
}

export function horizontalMovement(
    scene: GameScene,
    gameObject: GameObject,
): void {
    let data: HorizontalMovementData = (gameObject as any).horizontalMovement;
    if (data === undefined) {
        data = {
            start: gameObject.position,
            left: addPos(gameObject.position, createPoint(-50)),
            right: addPos(gameObject.position, createPoint(50)),
            goLeft: true,
        };
    }

    if (gameObject.position.x < data.left.x) {
        data.goLeft = false;
    }

    if (gameObject.position.x > data.right.x) {
        data.goLeft = true;
    }

    if (data.goLeft) {
        gameObject.position.x -= 2;
    } else {
        gameObject.position.x += 2;
    }

    (gameObject as any).horizontalMovement = data;
}
