import * as PIXI from 'pixi.js';
import { GameObject } from '../../game-object/game-object';
import { GameScene } from '../../scene/game-scene';

const left = 0;
const right = 100;
const start = 'ping';

export function horizontalMovement(
    scene: GameScene,
    gameObject: GameObject,
): void {
    if (!(gameObject as any).horizontalMovement) {
        (gameObject as any).horizontalMovement = {};
        (gameObject as any).horizontalMovement.ping = 'ping';
        (gameObject as any).horizontalMovement.start = gameObject.position.x;
    }
    const start = (gameObject as any).horizontalMovement.start;
    let ping = (gameObject as any).horizontalMovement.ping;
    let right = (gameObject as any).horizontalMovement.right;

    if (gameObject.position.x > start + left && ping === 'ping') {
        ping = 'pong';
    } else {
        if (gameObject.position.x < start && ping === 'pong') {
            ping = 'ping';
        }
    }

    if (right) {
        gameObject.position.x += 1;
    } else {
        gameObject.position.x -= 1;
    }

    (gameObject as any).horizontalMovement.ping = ping;
}
