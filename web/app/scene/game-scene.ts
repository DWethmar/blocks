import * as PIXI from 'pixi.js';
import { sortZYXAsc } from '../calc/sort';
import {
    createArch,
    createCheckers,
    createTerrainNoise,
    createTower,
} from '../terrain/terrain-utils';
import { BlockType } from '../block/block-type';
import { Scene, LoadAssetParams } from './scene';
import { Terrain, updateTerrain, createTerrain } from '../terrain/terrain';
import {
    bresenham3D, addPos,
} from '../position/point-utils';
import { BLOCK_SIZE, CHUNK_SIZE } from '../config';
import { Player, createPlayer, updatePlayer } from '../player/player';
import { Point3D, createPoint } from '../position/point';
import { GameComponent } from '../game-component/game-component';
// eslint-disable-next-line @typescript-eslint/no-var-requires
var Viewport = require('pixi-viewport');

// eslint-disable-next-line @typescript-eslint/no-var-requires
// import data from '../../assets/spritesheets/tiles-spritesheet.json';
// import image from '../../assets/spritesheets/tiles-spritesheet.png';
import { updateChunk } from '../chunk/chunk';

export class GameScene extends Scene {
    private terrain: Terrain;

    // public stage: Viewport;


    public constructor(stage: PIXI.Container) {
        super();

        this.gameComponents.setGameComponent(updateChunk);
        this.gameComponents.setGameComponent(updateTerrain);
        this.gameComponents.setGameComponent(updatePlayer);

        // this.loadAndRegisterAsset(
        //     new Promise<LoadAssetParams>(
        //         (resolve, reject): void => {
        //             const baseTexture = new PIXI.BaseTexture(image);
        //             const spritesheet = new PIXI.Spritesheet(baseTexture, data);
        //             spritesheet.parse(function(textures): void {
        //                 resolve({
        //                     name: 'spritesheet',
        //                     asset: spritesheet,
        //                 });
        //             });
        //         },
        //     ),
        // );

        this.stage = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: 1000,
            worldHeight: 1000,
            // interaction: app.renderer.plugins.interaction // the interaction module is important for wheel() to work properly when renderer.view is placed or scaled
        });

        // (this.stage as Viewport)
        //     .drag()
        //     .pinch()
        //     .wheel()
        //     .decelerate();

        this.stage.sortableChildren = false;

        this.terrain = createTerrain('terrain', this.gameObjects);
        this.gameObjects.setGameObject(this.terrain);

        createCheckers(this.terrain, BlockType.GRASS, BlockType.VOID, createPoint());
        createTower(this.terrain, BlockType.ROCK, createPoint(17, 15, 1));
        createTower(this.terrain, BlockType.ROCK, createPoint(20, 18, 1));
        createArch(this.terrain, BlockType.ROCK, createPoint(6, 1, 1));

        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                createCheckers(
                    this.terrain,
                    BlockType.GRASS,
                    BlockType.VOID,
                    addPos(createPoint(CHUNK_SIZE, 0, 0), createPoint(CHUNK_SIZE * x, CHUNK_SIZE * y, 0)),
                );
                createTerrainNoise(
                    this.terrain,
                    BlockType.GRASS,
                    BlockType.ROCK,
                    addPos(createPoint(CHUNK_SIZE, 0, 0), createPoint(CHUNK_SIZE * x, CHUNK_SIZE * y, 0)),
                );
            }
        }

        this.terrain.setBlock(createPoint(0, 0, 1), BlockType.ROCK);
        this.terrain.setBlock(createPoint(1, 0, 1), BlockType.ROCK);
        this.terrain.setBlock(createPoint(2, 0, 1), BlockType.ROCK);
        this.terrain.setBlock(createPoint(3, 0, 1), BlockType.ROCK);
        this.terrain.setBlock(createPoint(2, 0, 1), BlockType.ROCK);

        this.terrain.setBlock(createPoint(8, 0, 1), BlockType.GRASS);
        this.terrain.setBlock(createPoint(11, 0, 1), BlockType.GRASS);
        this.terrain.setBlock(createPoint(CHUNK_SIZE, 0, 1), BlockType.VOID);

        this.gameObjects.setGameObject(
            createPlayer('zoink', createPoint(75, 0, 10)),
        );
        this.gameObjects.activateGameObject('zoink');

        // Test Line
        bresenham3D(1, 0, 10, 10, 0, 20).forEach(p =>
            this.terrain.setBlock(p, BlockType.SELECTION),
        );
        // bresenham3D(0, CHUNK_SIZE, 10, CHUNK_SIZE, 0, CHUNK_SIZE).forEach(p =>
        //     this.terrain.setBlock(p, BlockType.SELECTION),
        // );
        stage.addChild(this.stage);

        console.log(this.gameObjects);
    }

    public update(delta: number): void {
        this.delta = delta;

        this.gameObjects.getActiveGameObjects().forEach(
            (gameObject): void => {
                gameObject.components &&
                    gameObject.components
                        .reduce((components, component) => {
                            if (
                                this.gameComponents.hasGameComponent(component)
                            ) {
                                components.push(
                                    this.gameComponents.getGameComponentById(
                                        component,
                                    ),
                                );
                            } else {
                                throw Error(
                                    `Component ${component} does not exists on ${
                                        gameObject.id
                                    }`,
                                );
                            }
                            return components;
                        }, [])
                        .forEach(component => component(gameObject, this));
            },
        );

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
