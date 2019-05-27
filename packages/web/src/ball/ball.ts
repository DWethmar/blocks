import * as PIXI from 'pixi.js';

import { GameObject, Point3D, Scene, GameComponent } from '@blocks/core';
import { getDrawPosition } from '../utils/game-object-utils';
import { createCircleGraphic } from '../graphics/circle';
import { pink } from '../color/colors';
import { GameScene } from '../scene/game-scene';

export interface Ball extends GameObject {
    RotateSpeed: number;
    Radius: number;
    angle: number;
    center: Point3D;
    view: PIXI.Container;
    physics: { [id: string]: any };
}

export function updateBall(scene: GameScene, ball: Ball): void {
    if (!ball.view) {
        ball.view = new PIXI.Container();
        ball.view.name = 'Ball';

        ball.center = Object.assign({}, ball.position);

        const [drawX, drawY] = getDrawPosition(ball.position);

        ball.view.x = drawX;
        ball.view.y = drawY;

        ball.view.addChild(createCircleGraphic(-2.5, -2.5, 5, pink));
        ball.view.zIndex = Math.ceil(ball.position.y);
        scene.stage.addChild(ball.view);
    }
    const [drawX, drawY, zIndex] = getDrawPosition(ball.position);
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
