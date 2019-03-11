import * as PIXI from "pixi.js";
import {Vector3D} from "./types";
import {GameObject} from "./game-object";
import {createCircleGraphic} from "./utils/graphics";
import {multiply} from "./utils/calc";
import {addPos, getX, getY} from "./utils/position";
import {BLOCK_SIZE, CHUNK_SIZE} from "./config";

export class Player extends GameObject {
    public playerView: PIXI.Container;

    private RotateSpeed = 0.1;
    private Radius = 30;
    private angle = 0;
    private center: Vector3D;

    get drawX(): number {
        return this.position.x;
    }

    get drawY(): number {
        return this.position.y - this.position.z + BLOCK_SIZE * CHUNK_SIZE;
    }

    constructor(id: string, readonly stage: PIXI.Container, position: Vector3D) {
        super(id, position);

        this.playerView = new PIXI.Container();
        this.playerView.name = 'Player';

        this.center = <Vector3D>this.position.vector3D.slice();

        this.playerView.x = this.position.x;
        this.playerView.y = this.position.y - this.position.z;

        this.playerView.addChild(createCircleGraphic(-2.5, -2.5, 5, 0x95f442));

        // this.playerView.pivot.x = 5;
        // this.playerView.pivot.y = -5;

        this.playerView.zIndex = Math.ceil(this.position.y);

        this.stage.addChild(this.playerView);
    }

    update(delta: number) {
        this.angle += this.RotateSpeed * delta;

        const offset = <Vector3D>(
            multiply(this.Radius, [Math.sin(this.angle), Math.cos(this.angle), 0])
        );

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
