import * as PIXI from "pixi.js";
import {Scene} from "../scene/scene";
import {GameScene} from "../scene/game-scene";

export class Game {

    // readonly stage: Viewport;
    readonly stage: PIXI.Container;
    scene: Scene;

    constructor(readonly app: PIXI.Application) {
        this.stage = new PIXI.Container();
        this.app.stage.addChild(this.stage);
        this.scene = new GameScene(this.stage);
    }

    update(delta: number) {
        this.scene.update(delta);
        // this.app.renderer.render(this.stage);
    }
}

function intersects(a: PIXI.Rectangle, b: PIXI.Rectangle) {
    return (
        (a.x + a.width > b.x && a.x + a.width <= b.x + b.width)
        || (b.x + b.width > a.x && b.x + b.width <= a.x + a.width)
    ) && (
        (a.y + a.height > b.y && a.y + a.height <= b.y + b.height)
        || (b.y + b.height > a.y && b.y + b.height <= a.y + a.height)
    );
}
