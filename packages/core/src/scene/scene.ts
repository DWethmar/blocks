import { GameObjectRepository } from '../game-object/game-object-repository';
import { GameComponentRepository } from '../game-component/game-component-repository';

export abstract class Scene {
    public gameObjects: GameObjectRepository;
    public gameComponents: GameComponentRepository;

    public delta = 0;

    public constructor() {
        this.gameComponents = new GameComponentRepository();
        this.gameObjects = new GameObjectRepository();
    }

    abstract update(delta: number);
}
