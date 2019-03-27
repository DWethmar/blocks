import * as PIXI from "pixi.js";

import {sortZYXAsc} from "../calc/sort";
import {createArch, createCheckers, createTerrainNoise, createTower} from "../terrain/terrain-utils";
import {BlockType} from "../block/block-type";
import {Scene} from "./scene";
import {Terrain} from "../terrain/terrain";
import {addPos} from "../position/point-utils";
import {CHUNK_SIZE} from "../config";
import {Player} from "../player/player";
import {Point3D} from "../position/point";
import * as Viewport from "pixi-viewport";
import * as Cull from "pixi-cull";

export class GameScene extends Scene {

    readonly camera: Viewport;
    cull: any;

    constructor(private stage: PIXI.Container) {
        super();

        this.camera = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: 1000,
            worldHeight: 1000,
        });
        this.camera.sortableChildren = false;

        const terrain = new Terrain(this.camera, this);
        this.gameObjectRepository.setGameObject(terrain);

        createCheckers(terrain, BlockType.GRASS, BlockType.VOID, [0, 0, 0]);
        createTower(terrain, BlockType.ROCK, [17, 15, 1]);
        createTower(terrain, BlockType.ROCK, [20, 18, 1]);
        createArch(terrain, BlockType.ROCK, [6, 1, 1]);

        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                createCheckers(terrain, BlockType.GRASS, BlockType.VOID, addPos([CHUNK_SIZE, -1, 0], [CHUNK_SIZE * x, CHUNK_SIZE * y, 0]));
                createTerrainNoise(terrain, BlockType.GRASS, BlockType.ROCK, addPos([CHUNK_SIZE, -1, 0], [CHUNK_SIZE * x, CHUNK_SIZE * y, 0]));
            }
        }

        terrain.addBlock([0, 0, 1], BlockType.ROCK);
        terrain.addBlock([1, 0, 1], BlockType.ROCK);
        terrain.addBlock([2, 0, 1], BlockType.ROCK);
        terrain.addBlock([3, 0, 1], BlockType.ROCK);
        terrain.addBlock([2, 0, 1], BlockType.ROCK);

        terrain.addBlock([8, 0, 1], BlockType.GRASS);
        terrain.addBlock([11, 0, 1], BlockType.GRASS);
        terrain.addBlock([CHUNK_SIZE, 0, 1], BlockType.VOID);

        this.gameObjectRepository.setGameObject(new Player(
            'zoink',
            this.camera,
            <Point3D>[75, 10, 10]
        ));
        this.gameObjectRepository.activateGameObject('zoink');

        this.stage.addChild(this.camera);

        this.camera
            .drag()
            .pinch()
            .wheel()
            .decelerate();
            // .moveCenter(10, 10);

        this.cull = new Cull.Simple();
        this.cull.addList(this.camera.children);
        this.cull.cull(this.camera.getVisibleBounds())
    }

    update(delta: number) {
        this.gameObjectRepository.getActiveGameObjects().forEach(g => g.update(delta));

        // Do own sorting
        this.camera.children.sort((a, b) => {
            const aZ = a.zIndex || 0;
            const bZ = b.zIndex || 0;
            return sortZYXAsc(
                [a.position.x, a.position.y, aZ],
                [b.position.x, b.position.y, bZ]
            );
        });

        // if (this.camera.dirty) {
        //     this.cull.cull(this.camera.getVisibleBounds());
        //     this.camera.dirty = false;
        // }
    }
}

function intersects(a: PIXI.Rectangle, b: PIXI.Rectangle) {
    return (
        (a.x + a.width > b.x && a.x + a.width <= b.x + b.width)
        || (b.x + b.width > a.x && b.x + b.width <= a.x + a.width)
    ) && (
        (a.y + a.height > b.y && a.y + a.height <= b.y + b.height)
        || (b.y + b.height > a.y && b.y + b.height <= a.y + a.height)
    );
}


