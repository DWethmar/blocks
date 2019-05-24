import * as PIXI from 'pixi.js';
import { GameObject } from '../game-object/game-object';
import { Point3D, createPoint } from '../position/point';
import { createCircleGraphic } from '../graphics/circle';
import { Scene } from '../scene/scene';
import { getDrawPosition } from '../game-object/game-object-utils';
import { pink } from '../color/colors';
import { dynamicsWorld, physicsObjects } from '../physics/physics';
import { debugPosition } from '../game-component/standard/debug-position';
import { GameComponent } from '../game-component/game-component';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Ammo = require('ammo.js');

export interface Ball extends GameObject {
    RotateSpeed: number;
    Radius: number;
    angle: number;
    center: Point3D;
    view: PIXI.Container;
    physics: { [id: string]: any };
}

export function updateBall(scene: Scene, ball: Ball): void {
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
