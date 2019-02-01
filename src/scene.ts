import * as PIXI from "pixi.js";

import {Chunk} from "./chunk";
import {BLOCK_SIZE} from "./config";
import {Vector3D} from "./types";
import {BlockType} from "./block";
import {sortYZXAsc, sortZYXAsc} from "./utils/sort";
import {Player} from "./player";
import {Terrain} from "./terrain";

export class Scene {

    readonly stage = new PIXI.Container();

    private terrain: Terrain;
    private player: Player;

    constructor(readonly root: PIXI.Container) {
        this.stage = root;

        this.terrain = new Terrain(this.stage);

        this.player = new Player(this.stage, [
            18 * BLOCK_SIZE,
            14 * BLOCK_SIZE,
            BLOCK_SIZE * 3
        ]);
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

        this.stage.children.sort((a, b) => {
            const aZ = (<any>a).zIndex || 0;
            const bZ = (<any>b).zIndex || 0;
            return sortYZXAsc(
                [a.position.x, a.position.y, aZ],
                [b.position.x, b.position.y, bZ]
            );
        });

        // Debug
        if (!(<any>this).kaas) {
            const x = this.stage.children.reduce((som, c) => {
                som.push(`P ${c.x} ${c.y} ${(<any>c).zIndex}`);
                return som;
            }, []);

            console.log(x);
            (<any>this).kaas = true
        }
    }
}