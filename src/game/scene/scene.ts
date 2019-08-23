import { Engine } from '../engine/engine';

export abstract class Scene {
    public engine: Engine;

    public delta = 0;

    public constructor() {
        this.engine = new Engine();
    }

    abstract update(delta: number);
}
