import * as PIXI from 'pixi.js';
import {Vector3D} from '../types';

export const attachContainer = (parent: PIXI.Container) =>
    (child: PIXI.Container) =>
        parent.addChild(child);


export const createContainer = (position: Vector3D) => {
    const container = new PIXI.Container();
    const [x, y, z] = position;
    container.x = x;
    container.y = y - z;
    return container;
};