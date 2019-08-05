import * as PIXI from 'pixi.js';

import {
    createArch,
    createCheckers,
    createTerrainNoise,
    createTower,
} from '../terrain/terrain-utils';
import { BlockType } from '../block/block-type';
import { createBlockSetter } from '../terrain/terrain';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Viewport = require('pixi-viewport');

// eslint-disable-next-line @typescript-eslint/no-var-requires
import data from '../../assets/spritesheets/tiles-spritesheet.json';
import image from '../../assets/spritesheets/tiles-spritesheet.png';

import updatePhysics from '../physics/physics';
import { AssetRepository } from '../assets/asset-repository';
import { Scene } from './scene';
import { createPoint, Point3D } from '../position/point';
import { addPos } from '../position/point-utils';
import { sortZYXAsc } from '../calc/sort';
import { ViewSystem } from '../engine/view-system';
import { Components } from '../components/components';
import { TerrainComponent } from '../components/terrain';
import { ViewComponent } from '../components/view';
import { TerrainSystem } from '../engine/terrain-system';
import { ChunkSystem } from '../engine/chunk-system';
import { CHUNK_SIZE } from '../config';

export class GameScene extends Scene {
    public stage: PIXI.Container;

    public terrainId: string;

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

        this.engine.addSystem(new ViewSystem(this.stage));
        this.engine.addSystem(new TerrainSystem());
        this.engine.addSystem(new ChunkSystem(this.stage, this.assets));

        // player
        // Pos
        const playerId = this.engine.createGameObject();
        const position = this.engine.getComponent(
            playerId,
            Components.POSITION,
        );
        this.engine.updateComponent(position.id, createPoint(75, 0, 10));
        // View
        this.engine.addComponent<ViewComponent>(playerId, Components.VIEW, {
            name: 'ball',
        });

        // terrain
        this.terrainId = this.engine.createGameObject();
        this.engine.addComponent<TerrainComponent>(
            this.terrainId,
            Components.TERRAIN,
            {
                chunks: {},
                blockQueue: [],
            },
        );

        this.init();
        app.stage.addChild(this.stage);
    }

    private async init(): Promise<void> {
        await this.assets.loadSpriteSheet(data, image);

        const blockSetter = createBlockSetter(this.terrainId, this.engine);
        // const blockGetter = createBlockGetter(terrain.state.chunks);

        Array.from(createTower(BlockType.ROCK, 20)).forEach(
            ([pos, type]: [Point3D, BlockType]): void => {
                void blockSetter(addPos(createPoint(20, 18, 1), pos), type);
            },
        );

        Array.from(createArch(BlockType.ROCK, createPoint(6, 1, 1))).forEach(
            ([pos, type]: [Point3D, BlockType]) => void blockSetter(pos, type),
        );

        Array.from(
            createCheckers(
                BlockType.GRASS,
                BlockType.VOID,
                CHUNK_SIZE,
                CHUNK_SIZE,
            ),
        ).forEach(
            ([pos, type]: [Point3D, BlockType]) => void blockSetter(pos, type),
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
                void blockSetter(
                    addPos(pos, createPoint(CHUNK_SIZE, 0, 0)),
                    type,
                ),
        );

        // // Test Line
        // bresenham3D(1, 0, 10, 10, 0, 20).forEach(p =>
        //     this.terrain.setBlock(p, BlockType.SELECTION),
        // );

        // // Remove some blocks
        // Array.from(
        //     iterateSelection(
        //         createPoint(CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE),
        //         createPoint(CHUNK_SIZE * 2, CHUNK_SIZE * 2, 0),
        //     ),
        // ).forEach(p => {
        //     console.log('banaan');
        //     this.terrain.setBlock(p, BlockType.AIR);
        // });
    }

    public update(delta: number): void {
        this.delta = delta;

        updatePhysics();

        this.engine.update(delta);

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
