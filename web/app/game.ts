import * as PIXI from "pixi.js";

import {Chunk} from "./chunk";
import {BLOCK_SIZE, CHUNK_SIZE} from "./config";
import {Vector3D} from "./types";
import {Block, BlockType} from "./block";
import {sortZYXAsc} from "./utils/sort";
import {Player} from "./player";
import {Terrain} from "./terrain";
import {Scene} from "./scene";
import {AddGameObject, GameObjectActionTypes} from "./actions/game-objects";
import {AddBlock, TerrainActionTypes} from "./actions/terrain-actions";
import {map, take} from "rxjs/operators";
import {Observable} from "rxjs";
// import * as Viewport from "pixi-viewport";

export class Game {

    // readonly stage: Viewport;
    readonly stage: PIXI.Container;

    scene: Scene;

    private terrain: Terrain;
    public player: Player;
    public player2: Player;

    constructor(readonly app: PIXI.Application) {

        // // create viewport
        // this.stage = new Viewport({
        //     screenWidth: app.screen.width,
        //     screenHeight: app.screen.height,
        //     worldWidth: 1000,
        //     worldHeight: 1000,
        //     interaction: (<any>app).renderer.interaction // the interaction module is important for wheel() to work properly when renderer.view is placed or scaled
        // });
        this.stage = new PIXI.Container();

        // activate plugins
        // this.stage
        //     .drag()
        //     .pinch()
        //     .wheel()
        //     .decelerate();

        this.player = new Player('player1', this.stage, [
            18 * BLOCK_SIZE,
            14 * BLOCK_SIZE,
            BLOCK_SIZE * 3
        ]);
        this.player2 = new Player('player2', this.stage, [
            0,
            CHUNK_SIZE * BLOCK_SIZE,
            BLOCK_SIZE
        ]);

        this.scene = new Scene();

        this.terrain = new Terrain(this.stage, this.scene);
        this.app.stage.addChild(this.stage);

        this.scene.emit(new AddGameObject({ gameObject: new Terrain(this.stage, this.scene)}));
    }

    addBlock(index: Vector3D, type: BlockType) {
        // return this.terrain.addBlock(index, type);
        this.scene.emit(new AddBlock({ block: new Block(type, <Vector3D>index.map(i => i * BLOCK_SIZE))}));
    }

    deleteBlock(index: Vector3D) {
        return this.terrain.deleteBlock(index);
    }

    deleteBlocks(startIndex: Vector3D, endIndex: Vector3D) {
        return this.terrain.deleteBlocks(startIndex, endIndex);
    }

    hasChunk(chunkPosition: Vector3D): Observable<boolean> {
        return this.terrain.getChunk(chunkPosition).pipe(
            map(chunk => !!chunk)
        );
    }

    getChunk(chunkPosition: Vector3D): Observable<Chunk | null> {
        return this.terrain.getChunk(chunkPosition);
    }

    update(delta: number) {

        this.scene.getState().pipe(
            take(1)
        ).subscribe(state => {
            state.activeGameObjects
                .map(id => state.gameObjects[id])
                .forEach(gameObject => void gameObject.update(delta));
        });

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

function intersects(a: PIXI.Rectangle, b: PIXI.Rectangle) {
    return (
        (a.x + a.width > b.x && a.x + a.width <= b.x + b.width)
        || (b.x + b.width > a.x && b.x + b.width <= a.x + a.width)
    ) && (
        (a.y + a.height > b.y && a.y + a.height <= b.y + b.height)
        || (b.y + b.height > a.y && b.y + b.height <= a.y + a.height)
    );
}
