import * as PIXI from 'pixi.js';
import { Scene } from '../scene/scene';
import { GameScene } from '../scene/game-scene';

export class Game {
    private readonly app: PIXI.Application;
    private readonly stage: PIXI.Container;
    private scene: Scene;

    public constructor(app: PIXI.Application) {
        this.app = app;
        this.stage = new PIXI.Container();
        this.app.stage.addChild(this.stage);
        this.scene = new GameScene(app);
    }

    public update(delta: number): void {
        this.scene.update(delta);
    }
}
