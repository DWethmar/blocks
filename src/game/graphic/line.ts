import * as PIXI from 'pixi.js';

export function createLineGraphic(
    x: number,
    y: number,
    xA: number,
    yA: number,
    xB: number,
    yB: number,
    color: number,
): PIXI.Graphics {
    const line = new PIXI.Graphics();
    line.lineStyle(2, color, 1);

    // Define line position - this aligns the top left corner of our canvas
    line.position.x = x;
    line.position.y = y;

    // Draw line
    line.moveTo(xA, yA);
    line.lineTo(xB, yB);

    return line;
}
