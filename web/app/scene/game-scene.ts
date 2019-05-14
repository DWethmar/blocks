
import * as PIXI from 'pixi.js';
import { sortZYXAsc } from '../calc/sort';
import { createArch, createCheckers, createTerrainNoise, createTower } from '../terrain/terrain-utils';
import { BlockType } from '../block/block-type';
import { Scene } from './scene';
import { Terrain } from '../terrain/terrain';
import { addPos, bresenham3D, getX, getY, getZ, minusPos } from '../position/point-utils';
import { BLOCK_SIZE, CHUNK_SIZE } from '../config';
import { Player } from '../player/player';
import { Point3D, createPoint } from '../position/point';
var Viewport = require('pixi-viewport');

export class GameScene extends Scene {

    readonly viewport: any;
    cull: any;

    terrain: Terrain;
    blockSelection: Point3D[];

    constructor(private stage: PIXI.Container) {
        super();

        this.viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: 1000,
            worldHeight: 1000,

            // interaction: app.renderer.plugins.interaction // the interaction module is important for wheel() to work properly when renderer.view is placed or scaled
        });
        this.viewport
            .drag()
            .pinch()
            .wheel()
            .decelerate();
        this.viewport.sortableChildren = false;

        this.terrain = new Terrain(this.viewport, this);
        this.gameObjectRepository.setGameObject(this.terrain);

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
                    addPos(createPoint(CHUNK_SIZE, -1, 0), createPoint(CHUNK_SIZE * x, CHUNK_SIZE * y, 0))
                );
                createTerrainNoise(
                    this.terrain,
                    BlockType.GRASS,
                    BlockType.ROCK,
                    addPos(createPoint(CHUNK_SIZE, -1, 0), createPoint(CHUNK_SIZE * x, CHUNK_SIZE * y, 0))
                );
            }
        }

        this.terrain.addBlock(createPoint(0, 0, 1), BlockType.ROCK);
        this.terrain.addBlock(createPoint(1, 0, 1), BlockType.ROCK);
        this.terrain.addBlock(createPoint(2, 0, 1), BlockType.ROCK);
        this.terrain.addBlock(createPoint(3, 0, 1), BlockType.ROCK);
        this.terrain.addBlock(createPoint(2, 0, 1), BlockType.ROCK);

        this.terrain.addBlock(createPoint(8, 0, 1), BlockType.GRASS);
        this.terrain.addBlock(createPoint(11, 0, 1), BlockType.GRASS);
        this.terrain.addBlock(createPoint(CHUNK_SIZE, 0, 1), BlockType.VOID);

        this.gameObjectRepository.setGameObject(new Player('zoink', this.viewport, createPoint(75, 10, 10)));
        this.gameObjectRepository.activateGameObject('zoink');

        // Test Line
        bresenham3D(1, 0, 10, 10, 0, 20).forEach((p) => this.terrain.addBlock(p, BlockType.SELECTION));

        this.stage.addChild(this.viewport);
        this.blockSelection = [];
    }

    update(delta: number) {
        this.gameObjectRepository.getActiveGameObjects().forEach((g) => g.update(delta));

        // Do own sorting
        this.viewport.children.sort((a, b) => {
            const aZ = a.zIndex || 0;
            const bZ = b.zIndex || 0;
            return sortZYXAsc(createPoint(a.position.x, a.position.y, aZ), createPoint(b.position.x, b.position.y, bZ));
        });

        // if (this.camera.dirty) {
        //     this.cull.cull(this.camera.getVisibleBounds());
        //     this.camera.dirty = false;
        // }

        // this.selection();
    }
}

function intersects(a: PIXI.Rectangle, b: PIXI.Rectangle) {
    return (
        ((a.x + a.width > b.x && a.x + a.width <= b.x + b.width) ||
            (b.x + b.width > a.x && b.x + b.width <= a.x + a.width)) &&
        ((a.y + a.height > b.y && a.y + a.height <= b.y + b.height) ||
            (b.y + b.height > a.y && b.y + b.height <= a.y + a.height))
    );
}
