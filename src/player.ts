import * as PIXI from "pixi.js";
import {Vector3D} from "./types";
import {GameObject} from "./game-object";
import {createCircleGraphic} from "./utils/graphics";
import {multiply} from "./utils/calc";
import {addPos, getX, getY} from "./utils/position";
import {BLOCK_SIZE, CHUNK_SIZE} from "./config";

export class Player extends GameObject {
  private playerView: PIXI.Container;

  private RotateSpeed = 0.1;
  private Radius = 30;
  private angle = 0;
  private center: Vector3D;

  constructor(readonly stage: PIXI.Container, position: Vector3D) {
    super(position);

    this.playerView = new PIXI.Container();

    this.center = <Vector3D>this.position.slice();

    this.playerView.x = this.x;
    this.playerView.y = this.y - this.z;

    this.playerView.addChild(createCircleGraphic(-2.5, -2.5, 5, 0x95f442));

    // this.playerView.pivot.x = 5;
    // this.playerView.pivot.y = -5;

    this.stage.addChild(this.playerView);
  }

  update(delta: number) {
    this.angle += this.RotateSpeed * delta;

    const offset = <Vector3D>(
      multiply(this.Radius, [Math.sin(this.angle), Math.cos(this.angle), 0])
    );

    const newPos = addPos(offset, this.center);

    this.x = getX(newPos);
    this.y = getY(newPos);

    const drawX = this.x;
    const drawY = this.y - this.z + BLOCK_SIZE * CHUNK_SIZE;

    this.playerView.x = drawX;
    this.playerView.y = drawY;
    (<any>this.playerView).zIndex = this.y;
  }
}
