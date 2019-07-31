import * as PIXI from 'pixi.js';

import {
    createArch,
    createCheckers,
    createTerrainNoise,
    createTower,
} from '../terrain/terrain-utils';
import { BlockType } from '../block/block-type';
import { Terrain, updateTerrain, createTerrain } from '../terrain/terrain';
import { createPlayer, updatePlayer } from '../player/player';
import { updateChunk } from '../chunk/chunk';
import { CHUNK_SIZE, BLOCK_SIZE } from '../config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Viewport = require('pixi-viewport');

// eslint-disable-next-line @typescript-eslint/no-var-requires
import data from '../../assets/spritesheets/tiles-spritesheet.json';
import image from '../../assets/spritesheets/tiles-spritesheet.png';

import { updateView, createBall } from '../ball/ball';
import { debugPosition } from '../components/standard/debug-position';
import updatePhysics from '../physics/physics';
import { horizontalMovement } from '../components/standard/ping-pong';
import { ballPhysics } from '../ball/components/ball-physics';
import { AssetRepository } from '../assets/asset-repository';
import { Scene } from './scene';
import { createPoint, Point3D } from '../position/point';
import { addPos, bresenham3D } from '../position/point-utils';
import { sortZYXAsc } from '../calc/sort';

export class GameScene extends Scene {
    public stage: PIXI.Container;

    public terrain: Terrain;

    public assets: AssetRepository;

    // public stage: Viewport;

    public constructor(app: PIXI.Application) {
        super();

        this.assets = new AssetRepository();
        this.stage = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: 1000,
            worldHeight: 1000,
            interaction: app.renderer.plugins.interaction, // the interaction module is important for wheel() to work properly when renderer.view is placed or scaled
        });
        this.stage.sortableChildren = false; // we are going to do our own sorting.

        (this.stage as any)
            .drag()
            .pinch()
            .wheel()
            .clampZoom({
                minWidth: 100,
                minHeight: 100,
                maxWidth: 2000,
                maxHeight: 2000,
            })
            .decelerate();

        this.gameComponents.register(updateChunk);
        this.gameComponents.register(updateTerrain);
        this.gameComponents.register(updatePlayer);
        this.gameComponents.register(updateView);
        this.gameComponents.register(debugPosition);
        this.gameComponents.register(horizontalMovement);
        this.gameComponents.register(ballPhysics);

        // player
        this.gameObjects.add(createPlayer('zoink', createPoint(75, 0, 10)));
        this.gameObjects.activate('zoink');

        // Balls
        for (let i = 0; i < 5; i++) {
            const boink = i % 2 === 0;
            this.gameObjects.add(
                createBall(
                    'ball-' + i,
                    addPos(
                        createPoint(50, 75, 0),
                        createPoint(
                            BLOCK_SIZE + (boink ? 1 : -1),
                            BLOCK_SIZE + (boink ? -1 : 1),
                            BLOCK_SIZE + BLOCK_SIZE * i + BLOCK_SIZE,
                        ),
                    ),
                    [updateView, ballPhysics, debugPosition],
                ),
            );
            this.gameObjects.activate('ball-' + i);
        }

        // terrain
        this.terrain = createTerrain('terrain', this.gameObjects);
        this.gameObjects.add(this.terrain);

        this.init();
        this.zIndexTest();

        app.stage.addChild(this.stage);
    }

    private zIndexTest(): void {
        const startX = 0;
        const startY = CHUNK_SIZE * 2;

        Array.from(
            createCheckers(
                BlockType.ROCK,
                BlockType.ROCK,
                CHUNK_SIZE,
                CHUNK_SIZE,
            ),
        ).forEach(
            ([pos, type]: [Point3D, BlockType]) =>
                void this.terrain.setBlock(
                    addPos(pos, createPoint(startX, startY)),
                    type,
                ),
        );

        Array.from(createTower(BlockType.GRASS, 20)).forEach(
            ([pos, type]: [Point3D, BlockType]): void => {
                for (let x = startX; x < startX + CHUNK_SIZE; x = x + 2) {
                    this.terrain.setBlock(
                        addPos(
                            createPoint(startX, startY),
                            addPos(createPoint(x, x, 0), pos),
                        ),
                        type,
                    );
                }
            },
        );

        for (let x = startX; x < startX + CHUNK_SIZE; x = x + 2) {
            const id = `ball-z-index-test-${x}`;
            this.gameObjects.add(
                createBall(
                    id,
                    addPos(
                        createPoint(startX * BLOCK_SIZE, startY * BLOCK_SIZE), // chunk x y z
                        createPoint(x * BLOCK_SIZE, x * BLOCK_SIZE, BLOCK_SIZE), // within chunk
                        createPoint(0, -BLOCK_SIZE, 0),
                    ),
                    [horizontalMovement, updateView],
                ),
            );
            this.gameObjects.activate(id);
        }
    }

    private async init(): Promise<void> {
        await this.assets.loadSpriteSheet(data, image);

        // Create positions of a tower and copy it 2 times.
        Array.from(createTower(BlockType.ROCK, 20)).forEach(
            ([pos, type]: [Point3D, BlockType]): void => {
                void this.terrain.setBlock(
                    addPos(createPoint(20, 18, 1), pos),
                    type,
                );
                void this.terrain.setBlock(
                    addPos(createPoint(17, 15, 1), pos),
                    type,
                );
            },
        );

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
                CHUNK_SIZE * 3,
                CHUNK_SIZE * 3,
            ),
        ).forEach(
            ([pos, type]: [Point3D, BlockType]) =>
                void this.terrain.setBlock(
                    addPos(pos, createPoint(CHUNK_SIZE, 0, 0)),
                    type,
                ),
        );

        // Test Line
        bresenham3D(1, 0, 10, 10, 0, 20).forEach(p =>
            this.terrain.setBlock(p, BlockType.SELECTION),
        );
    }

    public update(delta: number): void {
        this.delta = delta;

        updatePhysics();

        for (const gameObject of this.gameObjects.getActive()) {
            gameObject.components
                .reduce((components, component) => {
                    if (this.gameComponents.has(component)) {
                        components.push(this.gameComponents.getById(component));
                    } else {
                        throw Error(
                            `Component ${component} does not exists on ${gameObject.id}`,
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
