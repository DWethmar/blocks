import * as PIXI from 'pixi.js';
import { GameObject, Point3D, Scene, multiply, createPoint, addPos } from '@blocks/core';

import { getDrawPosition } from '../utils/game-object-utils';
import { createCircleGraphic } from '../graphics/circle';
import { BLOCK_SIZE, CHUNK_SIZE } from '../config';
import { debugPosition } from '../components/standard/debug-position';
import { GameScene } from '../scene/game-scene';

export interface Player extends GameObject {
    RotateSpeed: number;
    Radius: number;
    angle: number;
    center: Point3D;
    view: PIXI.Container;
}

export function updatePlayer(scene: GameScene, player: Player): void {
    if (!player.view) {
        player.view = new PIXI.Container();
        player.view.name = 'Player';

        player.center = Object.assign({}, player.position);

        const [drawX, drawY] = getDrawPosition(player.position);

        player.view.x = drawX;
        player.view.y = drawY;

        player.view.addChild(createCircleGraphic(-2.5, -2.5, 5, 0x95f442));

        player.view.zIndex = Math.ceil(player.position.y);

        scene.stage.addChild(player.view);
    }

    player.angle += player.RotateSpeed * scene.delta;

    const offset = multiply(
        player.Radius,
        createPoint(Math.sin(player.angle), Math.cos(player.angle), 0),
    );

    const newPos = addPos(offset, player.center);

    player.position.x = newPos.x;
    player.position.y = newPos.y;

    const drawX = player.position.x;
    const drawY =
        player.position.y - player.position.z + BLOCK_SIZE * CHUNK_SIZE;

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
        components: [updatePlayer.name, debugPosition.name],
        view: null,
    };
}
