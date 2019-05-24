import * as PIXI from 'pixi.js';
import { GameObject } from '../game-object/game-object';
import { Point3D, createPoint } from '../position/point';
import { createCircleGraphic } from '../graphics/circle';
import { Scene } from '../scene/scene';
import { getDrawPosition } from '../game-object/game-object-utils';
import { pink } from '../color/colors';
import { dynamicsWorld, bodies } from '../physics/physics';
import { debugPosition } from '../game-component/standard/debug-position';

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

    if (!ball.physics.trans) {
        ball.physics.trans = new Ammo.btTransform(); // taking this out of the loop below us reduces the leaking

        const colShape = new Ammo.btSphereShape(1);
        const startTransform = new Ammo.btTransform();

        startTransform.setIdentity();

        const mass = 1;
        const isDynamic = true; // mass !== 0;
        const localInertia = new Ammo.btVector3(0, 0, 0);

        if (isDynamic) {
            colShape.calculateLocalInertia(mass, localInertia);
        }

        startTransform.setOrigin(
            new Ammo.btVector3(
                ball.position.x,
                ball.position.z,
                ball.position.y,
            ),
        );

        const myMotionState = new Ammo.btDefaultMotionState(startTransform);
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(
            mass,
            myMotionState,
            colShape,
            localInertia,
        );
        const body = new Ammo.btRigidBody(rbInfo);

        dynamicsWorld.addRigidBody(body);
        bodies.push(body);
    }

    // physics
    dynamicsWorld.stepSimulation(1 / 60, 10);

    bodies.forEach(function(body) {
        if (body.getMotionState()) {
            body.getMotionState().getWorldTransform(ball.physics.trans);
            ball.position = createPoint(
                ball.physics.trans.getOrigin().x(),
                ball.physics.trans.getOrigin().z(),
                ball.physics.trans.getOrigin().y(),
            );
        }
    });
    // physics

    const [drawX, drawY, zIndex] = getDrawPosition(ball.position);
    ball.view.position.set(drawX, drawY);
    ball.view.zIndex = zIndex;
}

export function createBall(id: string, position: Point3D): Ball {
    return {
        id: id,
        position: position,
        RotateSpeed: 0.1,
        Radius: 30,
        angle: 0,
        center: position,
        components: [updateBall.name, debugPosition.name],
        view: null,
        physics: {},
    };
}
