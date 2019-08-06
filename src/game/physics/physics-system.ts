import * as PIXI from 'pixi.js';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Ammo = require('ammo.js');

import { Engine } from '../engine/engine';
import { System } from '../engine/system';
import { createPoint, Point3D } from '../position/point';
import { CHUNK_SIZE, BLOCK_SIZE } from '../config';
import { GameObject } from '../engine/game-object';
import { BallPhysics } from './ball-physics';
import { Component } from '../components/component';
import { Components } from '../components/components';

const updatePhysics = (): void => {};

export default updatePhysics;

export class PhysicsSystem extends System {
    private collisionConfiguration;
    private dispatcher;
    private overlappingPairCache;
    private solver;
    private dynamicsWorld;
    private groundShape;
    private groundTransform;

    private physicsObjects: {
        transform?: any;
        body: any;
        componentId?: string;
    }[];

    public constructor() {
        super();

        // https://github.com/kripken/ammo.js/blob/master/examples/hello_world.js
        // physics
        this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        this.dispatcher = new Ammo.btCollisionDispatcher(
            this.collisionConfiguration,
        );
        this.overlappingPairCache = new Ammo.btDbvtBroadphase();
        this.solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(
            this.dispatcher,
            this.overlappingPairCache,
            this.solver,
            this.collisionConfiguration,
        );
        this.dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

        this.groundShape = new Ammo.btBoxShape(
            new Ammo.btVector3(
                BLOCK_SIZE * CHUNK_SIZE,
                BLOCK_SIZE,
                BLOCK_SIZE * CHUNK_SIZE,
            ),
        );
        this.physicsObjects = [];
        this.groundTransform = new Ammo.btTransform();

        this.groundTransform.setIdentity();
        this.groundTransform.setOrigin(new Ammo.btVector3(0, 0, 0));

        const mass = 0;
        const isDynamic = mass !== 0;
        const localInertia = new Ammo.btVector3(0, 0, 0);

        if (isDynamic) {
            this.groundShape.calculateLocalInertia(mass, localInertia);
        }

        const myMotionState = new Ammo.btDefaultMotionState(
            this.groundTransform,
        );
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(
            mass,
            myMotionState,
            this.groundShape,
            localInertia,
        );
        const body = new Ammo.btRigidBody(rbInfo);

        this.dynamicsWorld.addRigidBody(body);
        this.physicsObjects.push({
            body: body,
            transform: this.groundTransform,
        });
    }

    public update(engine: Engine, delta: number): void {
        this.dynamicsWorld.stepSimulation(1 / 60, 10);

        engine
            .getAllComponents(Components.BALL_PHYSICS)
            .forEach((c: Component<BallPhysics>) => {
                if (!c.state.initialized) {
                    const position = engine.getComponent<Point3D>(
                        c.gameObjectId,
                        Components.POSITION,
                    );

                    this.addPhysics(position);

                    engine.updateComponent(c.id, {
                        initialized: true,
                    });
                }
            });

        this.physicsObjects.forEach(function(body) {
            if (body.body.getMotionState()) {
                body.body.getMotionState().getWorldTransform(body.transform);

                if (body.componentId) {
                    const p = createPoint(
                        body.transform.getOrigin().x(),
                        body.transform.getOrigin().z(),
                        body.transform.getOrigin().y(),
                    );
                    engine.updateComponent(body.componentId, p);
                }
            }
        });
    }

    private addPhysics(ball: Component<Point3D>): void {
        const trans = new Ammo.btTransform(); // taking this out of the loop below us reduces the leaking

        const colShape = new Ammo.btSphereShape(5);
        const startTransform = new Ammo.btTransform();

        startTransform.setIdentity();

        const mass = 1;
        const isDynamic = true; // mass !== 0;
        const localInertia = new Ammo.btVector3(0, 0, 0);

        if (isDynamic) {
            colShape.calculateLocalInertia(mass, localInertia);
        }

        startTransform.setOrigin(
            new Ammo.btVector3(ball.state.x, ball.state.z, ball.state.y),
        );

        const myMotionState = new Ammo.btDefaultMotionState(startTransform);
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(
            mass,
            myMotionState,
            colShape,
            localInertia,
        );
        const body = new Ammo.btRigidBody(rbInfo);
        this.dynamicsWorld.addRigidBody(body);
        this.physicsObjects.push({
            body: body,
            transform: trans,
            componentId: ball.id,
        });
    }
}
