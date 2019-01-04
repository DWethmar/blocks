import * as PIXI from 'pixi.js';

import {Chunk, chunkDivider} from './chunk';
import {BLOCK_SIZE, CHUNK_SIZE} from './config';
import {Vector3D} from './types';
import {BlockType} from './block';
import {positionId} from './utils/position';
import {multiply} from './utils/calc';

import InteractionEvent = PIXI.interaction.InteractionEvent;
import {sortZYX} from "./utils/sort";
import {GameObject} from "./game-object";

export class Scene {

    public readonly chunks: Map<string, Chunk> = new Map<string, Chunk>();
    public activeChunks: string[] = [];
    public updated = false;
    public camera = new GameObject([0, 0, 0]);

    readonly stage = new PIXI.Container();

    constructor(
        readonly root:          PIXI.Container,
        readonly renderer:      PIXI.WebGLRenderer | PIXI.CanvasRenderer
    ) {
        this.stage.interactive = true;
        this.stage.on('click', (event: InteractionEvent) => {
            //handle event
            console.log(':D');
        });

        root.addChild(this.stage);
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
        return this.chunks.has(positionId(chunkPosition));
    }

    getChunk(index: Vector3D): Chunk | null {
        return this.hasChunk(index) ? this.chunks.get(positionId(index)) : null;
    }

    createChunk(index: Vector3D): Chunk {
        this.updated = true;
        const position = <Vector3D>multiply(CHUNK_SIZE * BLOCK_SIZE, index);

        const chunk = new Chunk(
            this.stage,
            this.renderer,
            createChunkSelector(this),
            position
        );

        this.chunks.set(positionId(chunk.chunkPosition), chunk);
        this.activeChunks.push(positionId(chunk.chunkPosition));

        console.log(`Created Chunk: ${ positionId(chunk.chunkPosition) } `, chunk.chunkPosition);

        return chunk;
    }

    render(delta: number) {
        this.renderer.render(this.stage)
    }

    update(delta: number) {

        this.stage.position.x = this.camera.x;
        this.stage.position.y = this.camera.y - this.camera.z;

        this.activeChunks
            .map(id => this.chunks.get(id))
            .forEach((chunk: Chunk) => void chunk.update());

        // console.log(delta);
        if (this.updated) {
            // this.activeChunks.sort(((idA, idB) => {
            //     return sortZYX(this.chunks.get(idA).position, this.chunks.get(idB).position);
            // }));
            //
            // this.stage.children.sort((a, b) => this.activeChunks.indexOf(a.name) - this.activeChunks.indexOf(b.name));

            this.stage.children.sort((a, b) => {
                const aZ = (<any>a).zIndex;
                const bZ = (<any>b).zIndex;
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

            this.updated = false;
        }
    }
}

export const createChunkSelector = (scene: Scene) => (chunkPosition: Vector3D) => scene.hasChunk(chunkPosition) ? scene.getChunk(chunkPosition) : null;
