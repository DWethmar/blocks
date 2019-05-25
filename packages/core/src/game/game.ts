import { Scene } from '../scene/scene';

export class Game {
    public scene: Scene;

    public constructor() {}

    public update(delta: number): void {
        this.scene.update(delta);
    }
}
