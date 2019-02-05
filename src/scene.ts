import * as PIXI from "pixi.js";

import {Chunk} from "./chunk";
import {BLOCK_SIZE} from "./config";
import {Vector3D} from "./types";
import {BlockType} from "./block";
import {sortZYXAsc} from "./utils/sort";
import {Player} from "./player";
import {Terrain} from "./terrain";
import * as Viewport from "pixi-viewport";

export class Scene {

    readonly stage: Viewport;

    private terrain: Terrain;
    public player: Player;

    constructor(readonly app: PIXI.Application) {

        // create viewport
        this.stage = new Viewport({
            screenWidth: app.screen.width,
            screenHeight: app.screen.height,
            worldWidth: 1000,
            worldHeight: 1000,
            interaction: (<any>app).renderer.interaction // the interaction module is important for wheel() to work properly when renderer.view is placed or scaled
        });

        // activate plugins
        this.stage
            .drag()
            .pinch()
            .wheel()
            .decelerate();

        this.terrain = new Terrain(this.stage);
        this.player = new Player(this.stage, [
            18 * BLOCK_SIZE,
            14 * BLOCK_SIZE,
            BLOCK_SIZE * 3
        ]);

        this.app.stage.addChild(this.stage);
    }

    addBlock(index: Vector3D, type: BlockType) {
        return this.terrain.addBlock(index, type);
    }

    deleteBlock(index: Vector3D) {
        return this.terrain.deleteBlock(index);
    }

    deleteBlocks(startIndex: Vector3D, endIndex: Vector3D) {
        return this.terrain.deleteBlocks(startIndex, endIndex);
    }

    hasChunk(chunkPosition: Vector3D): boolean {
        return this.terrain.hasChunk(chunkPosition);
    }

    getChunk(chunkPosition: Vector3D): Chunk | null {
        return this.terrain.getChunk(chunkPosition);
    }

    update(delta: number) {
        this.terrain.activeChunkIds
            .map(id => this.terrain.chunks.get(id))
            .forEach((chunk: Chunk) => void chunk.update(delta));

        this.player.update(delta);
    }
}