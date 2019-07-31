import * as PIXI from 'pixi.js';

import { getDrawPosition } from '../utils/game-object-utils';
import { createCircleGraphic } from '../graphics/circle';
import { pink } from '../color/colors';
import { GameScene } from '../scene/game-scene';
import { GameObject } from '../game-object/game-object';
import { Point3D } from '../position/point';
import { GameComponent } from '../game-component/game-component';

export interface Ball extends GameObject {
    RotateSpeed: number;
    Radius: number;
    angle: number;
    center: Point3D;
    view: PIXI.Container;
    physics: { [id: string]: any };
}

export function updateBall(scene: GameScene, ball: Ball): void {
    const [drawX, drawY, zIndex] = getDrawPosition(ball.position);

    if (!ball.view) {
        ball.view = new PIXI.Container();
        ball.view.name = 'Ball';

        ball.center = Object.assign({}, ball.position);

        ball.view.x = drawX;
        ball.view.y = drawY;

        ball.view.addChild(createCircleGraphic(-2.5, -2.5, 5, pink));
        scene.stage.addChild(ball.view);
    }
    ball.view.position.set(drawX, drawY);
    ball.view.zIndex = zIndex;
}

export function createBall(
    id: string,
    position: Point3D,
    components: GameComponent[],
): Ball {
    return {
        id: id,
        position: position,
        RotateSpeed: 0.1,
        Radius: 30,
        angle: 0,
        center: position,
        components: components.map(c => c.name),
        view: null,
        physics: {},
    };
}
