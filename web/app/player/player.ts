import * as PIXI from 'pixi.js';
import { GameObject } from '../game-object/game-object';
import { Point3D, createPoint } from '../position/point';
import { BLOCK_SIZE, CHUNK_SIZE } from '../config';
import { createCircleGraphic } from '../graphics/circle';
import { multiply } from '../calc/calc';
import { addPos, getX, getY } from '../position/point-utils';

export class Player extends GameObject {
    public playerView: PIXI.Container;

    private RotateSpeed = 0.1;
    private Radius = 30;
    private angle = 0;
    private center: Point3D;

    public get drawX(): number {
        return this.position.x;
    }

    public get drawY(): number {
        return this.position.y - this.position.z + BLOCK_SIZE * CHUNK_SIZE;
    }

    public constructor(id: string, stage: PIXI.Container, position: Point3D) {
        super(id, position);

        this.playerView = new PIXI.Container();
        this.playerView.name = 'Player';

        this.center = Object.assign({}, this.position);

        this.playerView.x = this.position.x;
        this.playerView.y = this.position.y - this.position.z;

        this.playerView.addChild(createCircleGraphic(-2.5, -2.5, 5, 0x95f442));

        // this.playerView.pivot.x = 5;
        // this.playerView.pivot.y = -5;

        this.playerView.zIndex = Math.ceil(this.position.z);

        stage.addChild(this.playerView);
    }

    public update(delta: number): void {
        this.angle += this.RotateSpeed * delta;

        const offset = multiply(this.Radius, createPoint(Math.sin(this.angle), Math.cos(this.angle), 0));

        const newPos = addPos(offset, this.center);

        this.position.x = getX(newPos);
        this.position.y = getY(newPos);

        const drawX = this.drawX;
        const drawY = this.drawY;

        this.playerView.x = drawX;
        this.playerView.y = drawY;
        this.playerView.zIndex = Math.ceil(this.position.y);
    }
}
