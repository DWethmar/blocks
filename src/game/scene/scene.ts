import { Engine } from '../engine/engine';
// import { GameComponentRepository } from '../game-component/game-component-repository';

export abstract class Scene {
    public engine: Engine;
    // public gameComponents: GameComponentRepository;

    public delta = 0;

    public constructor() {
        // this.gameComponents = new GameComponentRepository();
        this.engine = new Engine();
    }

    abstract update(delta: number);
}
