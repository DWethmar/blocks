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
