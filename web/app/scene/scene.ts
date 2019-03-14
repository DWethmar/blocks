import {GameObjectRepository} from "../game-object/game-object-repository";

export abstract class Scene {

    gameObjectRepository: GameObjectRepository;
    activeGameObjects: string[];

    constructor() {
        this.gameObjectRepository = new GameObjectRepository();
        this.activeGameObjects = [];
    }

    abstract update(delta: number);
}

