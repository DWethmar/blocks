import * as PIXI from 'pixi.js';
import { GameObject } from '../game-object/game-object';
import { Point3D, createPoint } from '../position/point';
import { BLOCK_SIZE, CHUNK_SIZE } from '../config';
import { createCircleGraphic } from '../graphics/circle';
import { multiply } from '../calc/calc';
import { addPos} from '../position/point-utils';
import { Scene } from '../scene/scene';

export interface Player extends GameObject {
    RotateSpeed: number;
    Radius: number;
    angle: number;
    center: Point3D;
    view: PIXI.Container
}

export function updatePlayer(player: Player, scene: Scene) {

    if (!player.view) {
        player.view = new PIXI.Container();
        player.view.name = 'Player';

        player.center = Object.assign({}, player.position);

        player.view.x = player.position.x;
        player.view.y = player.position.y - player.position.z;

        player.view.addChild(createCircleGraphic(-2.5, -2.5, 5, 0x95f442));

        player.view.zIndex = Math.ceil(player.position.z);

        scene.stage.addChild(player.view);
    }

    player.angle += player.RotateSpeed * scene.delta;

    const offset = multiply(player.Radius, createPoint(Math.sin(player.angle), Math.cos(player.angle), 0));

    const newPos = addPos(offset, player.center);

    player.position.x = newPos.x
    player.position.y = newPos.y

    const drawX = player.position.x;
    const drawY = player.position.y - player.position.z + BLOCK_SIZE * CHUNK_SIZE;

    player.view.x = drawX;
    player.view.y = drawY;
    player.view.zIndex = Math.ceil(player.position.y);
}

export function createPlayer(id: string, position: Point3D): Player {
    return {
        id: id,
        position: position,
        RotateSpeed: 0.1,
        Radius: 30,
        angle: 0,
        center: position,
        components: [updatePlayer.name],
        view: null
    }
}

// export class Player extends GameObject {
//     public playerView: PIXI.Container;

//     private RotateSpeed = 0.1;
//     private Radius = 30;
//     private angle = 0;
//     private center: Point3D;

//     public get drawX(): number {
//         return this.position.x;
//     }

//     public get drawY(): number {
//         return this.position.y - this.position.z + BLOCK_SIZE * CHUNK_SIZE;
//     }

//     public constructor(id: string, stage: PIXI.Container, position: Point3D) {
//         super({ id: id, position: position });

//         this.playerView = new PIXI.Container();
//         this.playerView.name = 'Player';

//         this.center = Object.assign({}, this.position);

//         this.playerView.x = this.position.x;
//         this.playerView.y = this.position.y - this.position.z;

//         this.playerView.addChild(createCircleGraphic(-2.5, -2.5, 5, 0x95f442));

//         // this.playerView.pivot.x = 5;
//         // this.playerView.pivot.y = -5;

//         this.playerView.zIndex = Math.ceil(this.position.z);

//         stage.addChild(this.playerView);
//     }

//     public update(delta: number): void {
//         this.angle += this.RotateSpeed * delta;

//         const offset = multiply(this.Radius, createPoint(Math.sin(this.angle), Math.cos(this.angle), 0));

//         const newPos = addPos(offset, this.center);

//         this.position.x = getX(newPos);
//         this.position.y = getY(newPos);

//         const drawX = this.drawX;
//         const drawY = this.drawY;

//         this.playerView.x = drawX;
//         this.playerView.y = drawY;
//         this.playerView.zIndex = Math.ceil(this.position.y);
//     }
// }
