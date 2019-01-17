import * as PIXI from 'pixi.js';

import {Chunk, chunkDivider} from './chunk';
import {BLOCK_SIZE, CHUNK_SIZE} from './config';
import {Vector3D, viewPort} from './types';
import {BlockType} from './block';
import {multiply} from './utils/calc';
import {sortZYX} from "./utils/sort";
import {Camera} from "./camera";
import {Player} from "./player";
import {GameObject} from "./game-object";
import {getChunkId} from "./utils/id";

export class Scene {

    public readonly chunks: Map<string, GameObject> = new Map<string, GameObject>();

    public activeChunks: string[] = [];
    public updated = false;

    readonly stage = new PIXI.Container();

    private player: Player;

    constructor(
        readonly root: PIXI.Container,
    ) {
        this.stage = root;

        this.player = new Player(this.stage, [18 * BLOCK_SIZE, 14 * BLOCK_SIZE, BLOCK_SIZE * 3]);
    }

    addBlock(index: Vector3D, type: BlockType) {
        const blockPosition = <Vector3D>multiply(BLOCK_SIZE, index);
        const chunkIndex = <Vector3D>chunkDivider(CHUNK_SIZE * BLOCK_SIZE)(blockPosition);
        const chunk = (
            this.hasChunk(chunkIndex) ?
                this.getChunk(chunkIndex) :
                this.createChunk(chunkIndex)
        );
        this.updated = true;
        return chunk.createBlock(blockPosition, type);
    }

    hasChunk(chunkPosition: Vector3D): boolean {
        return this.chunks.has(getChunkId(chunkPosition));
    }

    getChunk(chunkPosition: Vector3D): Chunk | null {
        return this.hasChunk(chunkPosition) ? <Chunk>this.chunks.get(getChunkId(chunkPosition)) : null;
    }

    createChunk(index: Vector3D): Chunk {
        this.updated = true;
        const position = <Vector3D>multiply(CHUNK_SIZE * BLOCK_SIZE, index);

        const chunk = new Chunk(
            this.stage,
            createChunkSelector(this),
            position
        );

        this.chunks.set(getChunkId(chunk.chunkPosition), chunk);
        this.activeChunks.push(getChunkId(chunk.chunkPosition));

        console.log(`Created Chunk: ${ getChunkId(chunk.chunkPosition) } `, chunk.chunkPosition);

        return chunk;
    }

    render(delta: number) {
        // this.renderer.render(this.stage)
    }

    update(delta: number) {

        this.activeChunks
            .map(id => this.chunks.get(id))
            .forEach((chunk: Chunk) => void chunk.update(delta));

        this.player.update(delta);

        // if (this.updated) {
        //
        //
        //     this.updated = false;
        // }

        this.stage.children.sort((a, b) => {
            const aZ = (<any>a).zIndex || 0;
            const bZ = (<any>b).zIndex || 0;
            // a must be equal to b
            return sortZYX([
                a.position.x,
                a.position.y,
                aZ
            ],[
                b.position.x,
                b.position.y,
                bZ
            ]);
        });
    }
}

export const createChunkSelector = (scene: Scene) => (chunkPosition: Vector3D) => scene.hasChunk(chunkPosition) ? scene.getChunk(chunkPosition) : null;
