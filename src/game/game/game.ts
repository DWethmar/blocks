import { GameScene } from '../../game-scene';

export class Game {
    public scene: GameScene;

    public constructor() {}

    public update(delta: number): void {
        this.scene.update(delta);
    }
}
