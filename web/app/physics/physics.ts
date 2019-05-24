// eslint-disable-next-line @typescript-eslint/no-var-requires
const Ammo = require('ammo.js');

import { BLOCK_SIZE, CHUNK_SIZE } from '../config';
import { updateBall } from '../ball/ball';
import { createPoint } from '../position/point';
import { GameObject } from '../game-object/game-object';

// https://github.com/kripken/ammo.js/blob/master/examples/hello_world.js
// physics
export const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
export const dispatcher = new Ammo.btCollisionDispatcher(
    collisionConfiguration,
);
export const overlappingPairCache = new Ammo.btDbvtBroadphase();
export const solver = new Ammo.btSequentialImpulseConstraintSolver();
export const dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(
    dispatcher,
    overlappingPairCache,
    solver,
    collisionConfiguration,
);
dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

const groundShape = new Ammo.btBoxShape(
    new Ammo.btVector3(
        BLOCK_SIZE * CHUNK_SIZE,
        BLOCK_SIZE,
        BLOCK_SIZE * CHUNK_SIZE,
    ),
);
export const physicsObjects: {
    transform?: any;
    body: any;
    gameObject?: GameObject;
}[] = [];
const groundTransform = new Ammo.btTransform();

groundTransform.setIdentity();
groundTransform.setOrigin(new Ammo.btVector3(0, 0, 0));

// Make ground
(function() {
    const mass = 0;
    const isDynamic = mass !== 0;
    const localInertia = new Ammo.btVector3(0, 0, 0);

    if (isDynamic) {
        groundShape.calculateLocalInertia(mass, localInertia);
    }

    const myMotionState = new Ammo.btDefaultMotionState(groundTransform);
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(
        mass,
        myMotionState,
        groundShape,
        localInertia,
    );
    const body = new Ammo.btRigidBody(rbInfo);

    dynamicsWorld.addRigidBody(body);
    physicsObjects.push({
        body: body,
        transform: groundTransform,
    });
})();
// physics

const updatePhysics = (): void => {
    dynamicsWorld.stepSimulation(1 / 60, 10);
    physicsObjects.forEach(function(body) {
        if (body.body.getMotionState()) {
            body.body.getMotionState().getWorldTransform(body.transform);

            if (body.gameObject) {
                body.gameObject.position = createPoint(
                    body.transform.getOrigin().x(),
                    body.transform.getOrigin().z(),
                    body.transform.getOrigin().y(),
                );
            }
        }
    });
};

export default updatePhysics;
