export interface BallPhysics {
    initialized: boolean;
}

// export function ballPhysics(scene: GameScene, ball: Ball): void {
//     if (!ball.physics.trans) {
//         ball.physics.trans = new Ammo.btTransform(); // taking this out of the loop below us reduces the leaking

//         const colShape = new Ammo.btSphereShape(5);
//         const startTransform = new Ammo.btTransform();

//         startTransform.setIdentity();

//         const mass = 1;
//         const isDynamic = true; // mass !== 0;
//         const localInertia = new Ammo.btVector3(0, 0, 0);

//         if (isDynamic) {
//             colShape.calculateLocalInertia(mass, localInertia);
//         }

//         startTransform.setOrigin(
//             new Ammo.btVector3(
//                 ball.position.x,
//                 ball.position.z,
//                 ball.position.y,
//             ),
//         );

//         const myMotionState = new Ammo.btDefaultMotionState(startTransform);
//         const rbInfo = new Ammo.btRigidBodyConstructionInfo(
//             mass,
//             myMotionState,
//             colShape,
//             localInertia,
//         );
//         const body = new Ammo.btRigidBody(rbInfo);
//         dynamicsWorld.addRigidBody(body);
//         physicsObjects.push({
//             body: body,
//             transform: ball.physics.trans,
//             gameObject: ball,
//         });
//     }
// }
