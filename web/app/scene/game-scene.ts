import * as PIXI from 'pixi.js';
import { sortZYXAsc } from '../calc/sort';
import { createArch, createCheckers, createTerrainNoise, createTower } from '../terrain/terrain-utils';
import { BlockType } from '../block/block-type';
import { Scene, LoadAssetParams } from './scene';
import { Terrain } from '../terrain/terrain';
import { addPos, bresenham3D, getX, getY, getZ, minusPos } from '../position/point-utils';
import { BLOCK_SIZE, CHUNK_SIZE } from '../config';
import { Player } from '../player/player';
import { Point3D, createPoint } from '../position/point';

// eslint-disable-next-line @typescript-eslint/no-var-requires
var Viewport = require('pixi-viewport');

// eslint-disable-next-line @typescript-eslint/no-var-requires
import data from '../../assets/spritesheets/tiles-spritesheet.json';
import image from '../../assets/spritesheets/tiles-spritesheet.png';

export class GameScene extends Scene {
    public readonly viewport: any;

    private terrain: Terrain;
    private blockSelection: Point3D[];

    public constructor(stage: PIXI.Container) {
        super();

        this.loadAndRegisterAsset(
            new Promise<LoadAssetParams>(
                (resolve, reject): void => {
                    const baseTexture = new PIXI.BaseTexture(image);
                    const spritesheet = new PIXI.Spritesheet(baseTexture, data);
                    spritesheet.parse(function(textures): void {
                        resolve({
                            name: 'spritesheet',
                            asset: spritesheet,
                        });
                    });
                },
            ),
        );

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
                    addPos(createPoint(CHUNK_SIZE, -1, 0), createPoint(CHUNK_SIZE * x, CHUNK_SIZE * y, 0)),
                );
                createTerrainNoise(
                    this.terrain,
                    BlockType.GRASS,
                    BlockType.ROCK,
                    addPos(createPoint(CHUNK_SIZE, -1, 0), createPoint(CHUNK_SIZE * x, CHUNK_SIZE * y, 0)),
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

        this.gameObjects.setGameObject(new Player('zoink', this.viewport, createPoint(75, 10, 10)));
        this.gameObjects.activateGameObject('zoink');

        // Test Line
        bresenham3D(1, 0, 10, 10, 0, 20).forEach(p => this.terrain.addBlock(p, BlockType.SELECTION));

        stage.addChild(this.viewport);
        this.blockSelection = [];
    }

    public update(delta: number): void {
        this.gameObjects.getActiveGameObjects().forEach(
            (g): void => {
                g.update(delta);
            },
        );

        // Do own sorting
        this.viewport.children.sort(
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

// function intersects(a: PIXI.Rectangle, b: PIXI.Rectangle) {
//     return (
//         ((a.x + a.width > b.x && a.x + a.width <= b.x + b.width) ||
//             (b.x + b.width > a.x && b.x + b.width <= a.x + a.width)) &&
//         ((a.y + a.height > b.y && a.y + a.height <= b.y + b.height) ||
//             (b.y + b.height > a.y && b.y + b.height <= a.y + a.height))
//     );
// }
