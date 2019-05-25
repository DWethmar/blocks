import { GameObject } from './game-object';

export class GameObjectRepository {
    public gameObjects: { [id: string]: GameObject };
    public activeGameObjects: Set<string>;

    public constructor() {
        this.gameObjects = {};
        this.activeGameObjects = new Set<string>();
    }

    public getById(id: string): GameObject {
        if (this.has(id)) {
            return this.gameObjects[id];
        }
        return null;
    }

    public add(gameObject: GameObject): void {
        this.gameObjects[gameObject.id] = gameObject;
    }

    public has(id: string): boolean {
        return this.gameObjects.hasOwnProperty(id);
    }

    public activate(id: string): void {
        this.activeGameObjects.add(id);
    }

    public deactivate(id: string): boolean {
        return this.activeGameObjects.delete(id);
    }

    public isActive(id: string): boolean {
        return this.activeGameObjects.has(id);
    }

    public getActive(): GameObject[] {
        return Array.from(this.activeGameObjects).map(
            (id: string): GameObject => this.gameObjects[id],
        );
    }
}
