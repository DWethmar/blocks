import * as PIXI from "pixi.js";

export const createCircleGraphic = (
    x: number,
    y: number,
    radius: number,
    color: number
) => {
    const circle = new PIXI.Graphics();

    circle.beginFill(color);
    circle.drawCircle(x, y, radius);

    return circle;
};
