import * as PIXI from 'pixi.js';

import {
    createArch,
    createCheckers,
    createTerrainNoise,
    createTower,
} from './game/behavior/terrain/terrain-utils';
import { BlockType } from './game/behavior/block/block-type';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Viewport = require('pixi-viewport');

// eslint-disable-next-line @typescript-eslint/no-var-requires
import data from './assets/spritesheets/tiles-spritesheet.json';
import image from './assets/spritesheets/tiles-spritesheet.png';

import { AssetRepository } from './game/assets/asset-repository';
import { Scene } from './game/scene/scene';
import { createPoint, Point3D } from './game/position/point';
import { addPos, bresenham3D } from './game/position/point-utils';
import { sortZYXAsc } from './game/calc/sort';
import { Components } from './game/components/components';
import {
    TerrainComponent,
    BlockQueueItem,
} from './game/behavior/terrain/terrain-component';
import { GraphicComponent } from './game/graphic/graphic-component';
import { TerrainSystem } from './game/behavior/terrain/terrain-system';
import { CHUNK_SIZE } from './game/config';
import { BallPhysics } from './game/physics/ball-physics';
import { PhysicsSystem } from './game/physics/physics-system';
import { GraphicSystem } from './game/graphic/graphic-system';
import { ChunkSystem } from './game/behavior/chunk/chunk-system';
import { DebugLabelComponent } from './game/behavior/debug-label/debug-label-component';
import { DebugLabelSystem } from './game/behavior/debug-label/debug-label-system';

export class GameScene extends Scene {
    public stage: PIXI.Container;
    public terrainId: string;
    public assets: AssetRepository;

    public constructor(app: PIXI.Application) {
        super();

        this.assets = new AssetRepository();
        this.stage = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: 500,
            worldHeight: 500,
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

        this.engine.addSystem(new GraphicSystem(this.stage));
        this.engine.addSystem(new TerrainSystem());
        this.engine.addSystem(new ChunkSystem(this.stage, this.assets));
        this.engine.addSystem(new PhysicsSystem());
        this.engine.addSystem(new DebugLabelSystem(this.stage));

        // player
        // Pos
        const playerId = this.engine.createGameObject('player');
        const position = this.engine.getComponent(
            playerId,
            Components.POSITION,
        );
        this.engine.updateComponent(position.id, createPoint(75, 0, 10));
        // View
        this.engine.addComponent<GraphicComponent>(playerId, Components.VIEW, {
            name: 'ball',
        });
        this.engine.addComponent<DebugLabelComponent>(
            playerId,
            Components.DEBUG_LABEL,
            {
                offset: createPoint(10, 10, 0),
            },
        );

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

        // BALLLLL
        const ballId = this.engine.createGameObject();
        const ballPosition = this.engine.getComponent(
            playerId,
            Components.POSITION,
        );
        this.engine.updateComponent(ballPosition.id, createPoint(100, 10, 100));
        this.engine.addComponent<GraphicComponent>(ballId, Components.VIEW, {
            name: 'ball',
        });
        this.engine.addComponent<BallPhysics>(ballId, Components.BALL_PHYSICS, {
            initialized: false,
        });

        this.init();
        app.stage.addChild(this.stage);
    }

    private async init(): Promise<void> {
        await this.assets.loadSpriteSheet(data, image);

        const blockQueue: BlockQueueItem[] = [];

        const terrainComponent = this.engine.getComponent<TerrainComponent>(
            this.terrainId,
            Components.TERRAIN,
        );

        // const blockSetter = createBlockSetter(this.terrainId, this.engine);
        // const blockGetter = createBlockGetter(terrain.state.chunks);

        Array.from(createTower(BlockType.ROCK, 20)).forEach(
            ([pos, type]: [Point3D, BlockType]): void => {
                blockQueue.push({
                    blockWorldIndex: addPos(createPoint(20, 18, 1), pos),
                    type: type,
                });
            },
        );

        Array.from(createArch(BlockType.ROCK, createPoint(6, 1, 1))).forEach(
            ([pos, type]: [Point3D, BlockType]) =>
                blockQueue.push({
                    blockWorldIndex: pos,
                    type: type,
                }),
        );

        Array.from(
            createCheckers(
                BlockType.GRASS,
                BlockType.VOID,
                CHUNK_SIZE,
                CHUNK_SIZE,
            ),
        ).forEach(([pos, type]: [Point3D, BlockType]) =>
            blockQueue.push({
                blockWorldIndex: pos,
                type: type,
            }),
        );

        Array.from(
            createTerrainNoise(
                BlockType.GRASS,
                BlockType.ROCK,
                CHUNK_SIZE * 3,
                CHUNK_SIZE * 3,
            ),
        ).forEach(([pos, type]: [Point3D, BlockType]) =>
            blockQueue.push({
                blockWorldIndex: addPos(pos, createPoint(CHUNK_SIZE, 0, 0)),
                type: type,
            }),
        );
        // Test Line
        bresenham3D(1, 0, 10, 10, 0, 20).forEach(p =>
            blockQueue.push({
                blockWorldIndex: p,
                type: BlockType.SELECTION,
            }),
        );
        terrainComponent.state.blockQueue = blockQueue;
        this.engine.updateComponent(
            terrainComponent.id,
            terrainComponent.state,
        );
    }

    public update(delta: number): void {
        this.delta = delta;
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
