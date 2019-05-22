import * as PIXI from 'pixi.js';
import { sortZYXAsc } from '../calc/sort';
import {
    createArch,
    createCheckers,
    createTerrainNoise,
    createTower,
} from '../terrain/terrain-utils';
import { BlockType } from '../block/block-type';
import { Scene } from './scene';
import { Terrain, updateTerrain, createTerrain } from '../terrain/terrain';
import { bresenham3D, addPos } from '../position/point-utils';
import { createPlayer, updatePlayer } from '../player/player';
import { createPoint, Point3D } from '../position/point';
import { updateChunk } from '../chunk/chunk';
import { CHUNK_SIZE } from '../config';
import {
    createBlockRepository,
    iterateBlocks,
} from '../block/block-repository';
// eslint-disable-next-line @typescript-eslint/no-var-requires
var Viewport = require('pixi-viewport');

// eslint-disable-next-line @typescript-eslint/no-var-requires
// import data from '../../assets/spritesheets/tiles-spritesheet.json';
// import image from '../../assets/spritesheets/tiles-spritesheet.png';

export class GameScene extends Scene {
    public terrain: Terrain;

    // public stage: Viewport;

    public constructor(app: PIXI.Application) {
        super();

        this.gameComponents.provide(updateChunk);
        this.gameComponents.provide(updateTerrain);
        this.gameComponents.provide(updatePlayer);

        this.stage = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: 1000,
            worldHeight: 1000,
            interaction: app.renderer.plugins.interaction, // the interaction module is important for wheel() to work properly when renderer.view is placed or scaled
        });

        (this.stage as any)
            .drag()
            .pinch()
            .wheel()
            .decelerate();

        this.stage.sortableChildren = false; // we are going to do our own sorting.
        // player
        this.gameObjects.add(createPlayer('zoink', createPoint(75, 0, 10)));
        this.gameObjects.activate('zoink');
        // terrain
        this.terrain = createTerrain('terrain', this.gameObjects);
        this.gameObjects.add(this.terrain);

        // bresenham3D(0, 0, 0, 300, 0, 0).forEach((pos, i) =>
        //     this.terrain.setBlock(
        //         addPos(pos, createPoint(0, 0, 3)),
        //         i % CHUNK_SIZE > 0 ? BlockType.SELECTION : BlockType.VOID,
        //     ),
        // );

        createTower(this.terrain, BlockType.ROCK, createPoint(17, 15, 1));
        createTower(this.terrain, BlockType.ROCK, createPoint(20, 18, 1));
        createArch(this.terrain, BlockType.ROCK, createPoint(6, 1, 1));

        Array.from(
            createCheckers(
                BlockType.GRASS,
                BlockType.VOID,
                CHUNK_SIZE,
                CHUNK_SIZE,
            ),
        ).forEach(
            ([pos, type]: [Point3D, BlockType]) =>
                void this.terrain.setBlock(pos, type),
        );

        Array.from(
            createTerrainNoise(
                BlockType.GRASS,
                BlockType.ROCK,
                CHUNK_SIZE,
                CHUNK_SIZE,
            ),
        ).forEach(
            ([pos, type]: [Point3D, BlockType]) =>
                void this.terrain.setBlock(
                    addPos(pos, createPoint(CHUNK_SIZE, 0, 0)),
                    type,
                ),
        );

        // const z = createBlockRepository(CHUNK_SIZE, CHUNK_SIZE, 1);
        // for (let [pos, _] of iterateBlocks(z)) {
        //     this.terrain.setBlock(
        //         addPos(pos, createPoint(CHUNK_SIZE + 5, 0, 0)),
        //         BlockType.GRASS,
        //     );

        //     this.terrain.setBlock(
        //         addPos(pos, createPoint(0, 0, 0)),
        //         BlockType.ROCK,
        //     );
        // }

        // Test Line
        // bresenham3D(1, 0, 10, 10, 0, 20).forEach(p =>
        //     this.terrain.setBlock(p, BlockType.SELECTION),
        // );
        app.stage.addChild(this.stage);
    }

    public update(delta: number): void {
        this.delta = delta;

        for (const gameObject of this.gameObjects.getActive()) {
            gameObject.components
                .reduce((components, component) => {
                    if (this.gameComponents.has(component)) {
                        components.push(this.gameComponents.getById(component));
                    } else {
                        throw Error(
                            `Component ${component} does not exists on ${
                                gameObject.id
                            }`,
                        );
                    }
                    return components;
                }, [])
                .forEach(component => component(this, gameObject));
        }

        // Do own sorting
        this.stage.children.sort(
            (a: PIXI.Container, b: PIXI.Container): number => {
                const aZ = a.zIndex || 0;
                const bZ = b.zIndex || 0;
                return sortZYXAsc(
                    createPoint(a.position.x, a.position.y, aZ),
                    createPoint(b.position.x, b.position.y, bZ),
                );
            },
        );
    }
}
