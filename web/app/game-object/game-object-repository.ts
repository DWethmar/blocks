import { GameObject } from './game-object';

export class GameObjectRepository {
	gameObjects: { [id: string]: GameObject };
	activeGameObjects: Set<string>;

	constructor() {
		this.gameObjects = {};
		this.activeGameObjects = new Set<string>();
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

	hasGameObject(id: string): boolean {
		return this.gameObjects.hasOwnProperty(id);
	}

	activateGameObject(id: string): void {
		this.activeGameObjects.add(id);
	}

	deactivateGameObject(id: string): boolean {
		return this.activeGameObjects.delete(id);
	}

	isGameObjectActive(id: string): boolean {
		return this.activeGameObjects.has(id);
	}

	getActiveGameObjects(): GameObject[] {
		return Array.from(this.activeGameObjects).map((id) => this.gameObjects[id]);
	}
}
