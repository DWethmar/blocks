import * as PIXI from "pixi.js";
import {BLOCK_SIZE} from "./config";
import {Vector3D} from "./types";
import {Block, BlockType} from "./block";
import {sortZYXAsc} from "./utils/sort";
import {Player} from "./player";
import {Terrain} from "./terrain";
import {Scene} from "./scene";
import {AddGameObject, GameObjectActionTypes} from "./actions/game-objects";
import {AddBlock} from "./actions/terrain-actions";
import {take, withLatestFrom} from "rxjs/operators";

// import * as Viewport from "pixi-viewport";

export class Game {

    // readonly stage: Viewport;
    readonly stage: PIXI.Container;
    scene: Scene;

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
        this.app.stage.addChild(this.stage);

        // activate plugins
        // this.stage
        //     .drag()
        //     .pinch()
        //     .wheel()
        //     .decelerate();

        this.scene = new Scene();

        this.scene.listen<AddGameObject>(GameObjectActionTypes.ADD_GAME_OBJECT)
            .pipe(
                withLatestFrom(this.scene.getState().pipe(take(1))),
            )
            .subscribe(([action, state]: [AddGameObject, any]) => {
                state.gameObjects[action.payload.gameObject.id] = action.payload.gameObject;
                if (action.payload.active) {
                    state.activeGameObjects.push(action.payload.gameObject.id);
                }
                this.scene.update(state);
            });

        this.scene.emit(new AddGameObject({ gameObject: new Terrain(this.stage, this.scene), active: true}));
        this.scene.emit(new AddGameObject({
            gameObject: new Player(
                'player1',
                this.stage,
                [
                    18 * BLOCK_SIZE,
                    14 * BLOCK_SIZE,
                    BLOCK_SIZE * 3
                ]
            ),
            active: true }));

        this.scene.emit(new AddGameObject({
            gameObject: new Player(
                'player2',
                this.stage,
                [
                    0,
                    14 * BLOCK_SIZE,
                    BLOCK_SIZE * 3
                ]
            ),
            active: true
        }));
    }

    addBlock(index: Vector3D, type: BlockType) {
        const p = <Vector3D>index.map(i => i * BLOCK_SIZE);
        this.scene.emit(new AddBlock({
            block: new Block(type, p)
        }));
    }

    update(delta: number) {
        this.scene.getState().pipe(
            take(1)
        ).subscribe(state => {
            state.activeGameObjects
                .map(id => state.gameObjects[id])
                .forEach(gameObject => void gameObject.update(delta));

            this.scene.update(state);
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
