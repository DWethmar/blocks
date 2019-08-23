import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { switchMap, map, take, takeUntil } from 'rxjs/operators';

import { GameObject } from './game-object';
import { System } from './system';
import { Component } from '../components/component';
import { Components } from '../components/components';

import { v1 as uuidv1 } from 'uuid';
import { Point3D, createPoint } from '../position/point';

export interface GameState {
    gameObjects: { [id: string]: GameObject };
    components: { [id: string]: Component<unknown> };
    activeGameObjects: Set<string>;
    groupedComponents: {
        [componentType: string]: string[]; // componentType -> componentId
    };
}

/**
 * https://github.com/nova-engine/ecs
 * http://ripplega.me/development/ecs-ez/
 */
export class Engine {
    // Old state stuff
    private gameObjects: { [id: string]: GameObject };
    private components: { [id: string]: Component<unknown> };
    private activeGameObjects: Set<string>;
    private groupedComponents: {
        [componentType: string]: string[]; // componentType -> componentId
    };

    public destroyed: Subject<void> = new Subject();

    // New state
    public state: BehaviorSubject<GameState>;
    public addGameObject: Subject<GameObject>;

    private systems: System[];
    private ids = 0;

    public constructor() {
        this.gameObjects = {};
        this.components = {};
        this.activeGameObjects = new Set<string>();
        this.groupedComponents = {};

        this.systems = [];

        // Test state stuff
        this.state = new BehaviorSubject({
            gameObjects: {},
            components: {},
            activeGameObjects: new Set<string>(),
            groupedComponents: {},
        });

        // Add gameobject
        this.addGameObject = new Subject<GameObject>();
        this.addGameObject
            .pipe(
                takeUntil(this.destroyed),
                switchMap(gameObject =>
                    this.state.pipe(
                        take(1),
                        map(state => {
                            state.gameObjects[gameObject.id] = gameObject;
                            return Object.assign({}, state);
                        }),
                    ),
                ),
            )
            .subscribe(state => {
                console.log(state);
                this.state.next(state);
            });
    }

    public update(delta: number): void {
        this.systems.forEach(s => s.update(this, delta));
    }

    public createGameObject(name?: string): string {
        this.ids++;
        const id = this.ids.toString();
        const gameObject = {
            id: id,
            name: name || `go-${id}`,
            components: {},
        };
        this.gameObjects[id] = gameObject;
        this.addComponent<Point3D>(id, Components.POSITION, createPoint());

        //test
        this.addGameObject.next(gameObject);

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

    // Component
    public addComponent<T>(
        gameObjectID: string,
        type: string,
        state: T,
    ): Component<T> {
        if (
            this.gameObjectExists(gameObjectID) &&
            !this.hasComponent(gameObjectID, type)
        ) {
            const componentId = uuidv1();
            const component: Component<T> = {
                id: componentId,
                type: type,
                gameObjectId: gameObjectID,
                dirty: false,
                state: state,
            };
            this.components[componentId] = component;
            this.gameObjects[gameObjectID].components[type] = componentId;

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
        system.onAttach(this);
        this.systems.push(system);
    }
}
