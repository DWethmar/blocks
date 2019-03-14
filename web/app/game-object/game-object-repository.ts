import {GameObject} from "./game-object";

export class GameObjectRepository {

    gameObjects: { [id: string]: GameObject };

    constructor() {
        this.gameObjects = {};
    }

    getGameObject(id: string): GameObject {
        if (this.hasGameObject(id)) {
            return this.gameObjects[id];
        }
        return null;
    }

    setGameObject(gameObject: GameObject) {
        this.gameObjects[gameObject.id] = gameObject;
    }

    hasGameObject(id): boolean {
        return this.gameObjects.hasOwnProperty(id);
    }

}
