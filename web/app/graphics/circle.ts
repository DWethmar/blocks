import * as PIXI from 'pixi.js';
import { LightenDarkenColor } from '../color/color';

export function createCircleGraphic(
    x: number,
    y: number,
    radius: number,
    color: number,
): PIXI.Graphics {
    const circle = new PIXI.Graphics();

    circle.beginFill(color);
    circle.drawCircle(x, y, radius);
    circle.endFill();
    circle.lineStyle(2, LightenDarkenColor(color, -50));
    circle.drawCircle(x, y, radius);

    return circle;
}
