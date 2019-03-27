import {GameObjectRepository} from "../game-object/game-object-repository";

export abstract class Scene {

    gameObjectRepository: GameObjectRepository;

    constructor() {
        this.gameObjectRepository = new GameObjectRepository();
    }

    abstract update(delta: number);
}

