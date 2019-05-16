import { GameObject } from './game-object';

export class GameObjectRepository {
    public gameObjects: { [id: string]: GameObject };
    public activeGameObjects: Set<string>;

    public constructor() {
        this.gameObjects = {};
        this.activeGameObjects = new Set<string>();
    }

    public getGameObject(id: string): GameObject {
        if (this.hasGameObject(id)) {
            return this.gameObjects[id];
        }
        return null;
    }

    public setGameObject(gameObject: GameObject): void {
        this.gameObjects[gameObject.id] = gameObject;
    }

    public hasGameObject(id: string): boolean {
        return this.gameObjects.hasOwnProperty(id);
    }

    public activateGameObject(id: string): void {
        this.activeGameObjects.add(id);
    }

    public deactivateGameObject(id: string): boolean {
        return this.activeGameObjects.delete(id);
    }

    public isGameObjectActive(id: string): boolean {
        return this.activeGameObjects.has(id);
    }

    public getActiveGameObjects(): GameObject[] {
        return Array.from(this.activeGameObjects).map(id => this.gameObjects[id]);
    }
}
