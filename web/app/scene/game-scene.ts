import {GameObjectRepository} from "../game-object/game-object-repository";
import {sortZYXAsc} from "../calc/sort";
import {createArch, createCheckers, createTerrainNoise, createTower} from "../terrain/terrain-utils";
import {BlockType} from "../block/block-type";
import {Scene} from "./scene";
import {Terrain} from "../terrain/terrain";
import {addPos} from "../position/point-utils";
import {CHUNK_SIZE} from "../config";

export class GameScene extends Scene {

    constructor(private stage: PIXI.Container) {
        super();

        this.gameObjectRepository = new GameObjectRepository();

        const terrain = new Terrain(stage, this);
        this.gameObjectRepository.setGameObject(terrain);

        createCheckers(terrain, BlockType.GRASS, BlockType.VOID, [0, 0, 0]);
        createTower(terrain, BlockType.ROCK, [17, 15, 1]);
        createTower(terrain, BlockType.ROCK, [20, 18, 1]);
        createArch(terrain, BlockType.ROCK, [6, 1, 1]);

        for (let x = 0; x < 2; x++) {
            for (let y = 0; y < 2; y++) {
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
    }

    update(delta: number) {
        this.activeGameObjects
            .map(id => this.gameObjectRepository.getGameObject(id))
            .forEach(gameObject => void gameObject.update(delta));

        // Do own sorting
        this.stage.children.sort((a, b) => {
            const aZ = a.zIndex || 0;
            const bZ = b.zIndex || 0;
            return sortZYXAsc(
                [a.position.x, a.position.y, aZ],
                [b.position.x, b.position.y, bZ]
            );
        });

        // this.terrain.chunks.forEach(chunk => {
        //     const bounds = this.stage.getVisibleBounds();
        //     const sceneRect = new PIXI.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height);
        //     if (intersects(sceneRect, chunk.bounds)) {
        //         chunk.show();
        //     } else {
        //         chunk.hide();
        //     }
        // });
    }
}

