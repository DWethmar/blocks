import { GameObject } from './game-object';
import { System } from './system';
import { Component } from '../components/component';
import { Components } from '../components/components';

import { v1 as uuidv1 } from 'uuid';
import { Point3D, createPoint } from '../position/point';

/**
 * https://github.com/nova-engine/ecs
 * http://ripplega.me/development/ecs-ez/
 */
export class Engine {
    private gameObjects: { [id: string]: GameObject };
    private components: { [id: string]: Component<unknown> };

    private activeGameObjects: Set<string>;
    private systems: System[];

    private groupedComponents: {
        [componentType: string]: string[]; // componentType -> componentId
    };

    private ids = 0;

    public constructor() {
        this.gameObjects = {};
        this.components = {};
        this.activeGameObjects = new Set<string>();
        this.systems = [];
        this.groupedComponents = {};
    }

    public update(delta: number): void {
        this.systems.forEach(s => s.update(this, delta));
    }

    public createGameObject(position?: Point3D, name?: string): string {
        this.ids++;
        const id = this.ids.toString();
        this.gameObjects[id] = {
            id: id,
            name: name || `go-${id}`,
            components: {},
        };
        this.addComponent<Point3D>(
            id,
            Components.POSITION,
            position || createPoint(),
        );
        return id;
    }

    public gameObjectExists(id: string): boolean {
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
        return Array.from(this.activeGameObjects).map(
            (id: string): GameObject => this.gameObjects[id],
        );
    }

    // private getGameObject(id: string): GameObject | null {
    //     if (this.gameObjectExists(id)) {
    //         return this.gameObjects[id];
    //     }
    //     return null;
    // }

    // Component
    public addComponent<T>(id: string, type: string, state: T): Component<T> {
        if (this.gameObjectExists(id) && !this.hasComponent(id, type)) {
            const componentId = uuidv1();
            const component: Component<T> = {
                id: componentId,
                type: type,
                gameObjectId: id,
                dirty: false,
                state: state,
            };
            this.components[componentId] = component;
            this.gameObjects[id].components[type] = componentId;

            // Add relation from component to gameObject
            if (!this.groupedComponents.hasOwnProperty(type)) {
                this.groupedComponents[type] = [];
            }
            this.groupedComponents[type].push(componentId);

            return component;
        }
    }

    public getAllComponents(type: string): Component<unknown>[] {
        if (this.groupedComponents.hasOwnProperty(type)) {
            return this.groupedComponents[type].map(
                componentId => this.components[componentId],
            );
        }
        return [];
    }

    public getComponent<T>(gameObjectId: string, type: string): Component<T> {
        if (this.hasComponent(gameObjectId, type)) {
            const componentId = this.gameObjects[gameObjectId].components[type];
            return { ...(this.components[componentId] as Component<T>) }; // copy component
        }
        return null;
    }

    public hasComponent(gameObjectId: string, type: string): boolean {
        return (
            this.gameObjectExists(gameObjectId) &&
            this.gameObjects[gameObjectId].components.hasOwnProperty(type)
        );
    }

    public updateComponent(componentId: string, state: unknown): void {
        this.components[componentId].state = state;
    }

    // system.
    public addSystem(system: System): void {
        this.systems.push(system);
    }
}
