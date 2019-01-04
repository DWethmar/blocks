import * as PIXI from 'pixi.js';
import {Vector3D, viewPort} from './types';
import {GameObject} from './game-object';

export class Player extends GameObject {


    constructor(
        position: Vector3D
    ) {
        super(position);
    }

    update(delta: number) {

    }

}
