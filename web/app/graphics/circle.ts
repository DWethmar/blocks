import * as PIXI from 'pixi.js';

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
    circle.drawCircle(x, y, radius);

    return circle;
}
