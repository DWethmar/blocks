import * as PIXI from "pixi.js";
import {Chunk, chunkDivider} from "./chunk";
import {Vector3D} from "./types";
import {Block} from "./block";
import {multiply} from "./utils/calc";
import {BLOCK_SIZE, CHUNK_SIZE} from "./config";
import {getX, getY, getZ, isEqual} from "./utils/position";
import {getBlockId, getChunkId} from "./utils/id";
import {GameObject} from "./game-object";
import {Scene, SceneState} from "./scene";
import {AddBlock, TerrainActionTypes} from "./actions/terrain-actions";
import {filter, map, switchMap, take, tap, withLatestFrom} from "rxjs/operators";
import {iif, Observable, of, zip} from "rxjs";

export class Terrain extends GameObject {

    constructor(
        readonly stage: PIXI.Container,
        readonly scene: Scene,
    ) {
        super('terrain', [0, 0, 0]);

        this.scene.listen(TerrainActionTypes.ADD_BLOCK)
            .pipe(
                withLatestFrom(this.scene.getState()),
                switchMap(([action, state]: [AddBlock, SceneState]) =>
                    iif(
                        () => state.gameObjects.hasOwnProperty(action.payload.block.chunkIndex.chunkId),
                        this.getChunk(action.payload.block.chunkIndex.point),
                        of(this.createChunk(action.payload.block.chunkIndex.point))
                    ).pipe(
                        take(1),
                        tap(chunk => {
                            chunk.addBlock(action.payload.block)
                        }),
                        map(chunk => [chunk, state])
                    )
                ),
            )
            .subscribe(([chunk, state]: [Chunk, SceneState]) => {
                console.log(`Added block to chunk: ${ chunk.id }`);
                state.activeGameObjects.push(chunk.id );
                state.gameObjects[chunk.id] = chunk;
                this.scene.update(state);
            });

        this.scene.listen(TerrainActionTypes.REMOVE_BLOCK)
            .pipe(
                switchMap((action: AddBlock) => this.deleteBlock(action.payload.block.blockIndex.point)),
                withLatestFrom(this.scene.getState()),
            )
            .subscribe(([chunk, state]: [Chunk, SceneState]) => {
                console.log(`Removed block to chunk: ${ chunk.id }`);
                state.gameObjects[chunk.id] = chunk;
                state.activeGameObjects.push(chunk.id);
                this.scene.update(state);
            });
    }

    /**
     * @param block The world position of the block.
     */
    private addBlock(block: Block): Observable<Chunk> {
        const chunkIndex = block.chunkIndex.point;
        return this.getChunk(chunkIndex).pipe(
            take(1),
            tap(chunk => console.log('Found chunk:', chunk)),
            tap(chunk => chunk.addBlock(block))
        );
    }

    getBlock(worldPosition: Vector3D): Observable<Block | null> {
        const blockPosition = <Vector3D>multiply(BLOCK_SIZE, worldPosition);
        const chunkIndex = <Vector3D>(
            chunkDivider(CHUNK_SIZE * BLOCK_SIZE)(blockPosition)
        );
        return this.getChunk(chunkIndex).pipe(
            take(1),
            map(chunk => chunk ? chunk.blocks.get(getBlockId(worldPosition)) : null)
        );
    }

    deleteBlocks(startIndex: Vector3D, endIndex: Vector3D): Observable<Block[]> {
        let startX = getX(startIndex);
        let startY = getY(startIndex);
        let startZ = getZ(startIndex);

        const endX = getX(endIndex);
        const endY = getY(endIndex);
        const endZ = getZ(endIndex);

        const deletions = [];

        while (!isEqual([startX, startY, startZ], [endX, endY, endZ])) {
            if (startX != endX) {
                startX > endX ? startX-- : startX++;
            } else {
                if (startY != endY) {
                    startY > endY ? startY-- : startY++;
                } else {
                    if (startZ != endZ) {
                        endZ ? startZ-- : startZ++;
                    }
                }
            }
            deletions.push(this.deleteBlock([startX, startY, startZ]));
        }

        return zip<Block[]>(deletions);
    }

    deleteBlock(index: Vector3D): Observable<Chunk> {
        const blockPosition = <Vector3D>multiply(BLOCK_SIZE, index);
        const chunkIndex = <Vector3D>(
            chunkDivider(CHUNK_SIZE * BLOCK_SIZE)(blockPosition)
        );
        return this.getChunk(chunkIndex).pipe(
            filter(chunk => !!chunk),
            take(1),
            tap(chunk => chunk.removeBlock(index)),
        );
    }

    getChunk(chunkIndex: Vector3D): Observable<Chunk> {
        return this.scene.getGameObject(getChunkId(chunkIndex)) as Observable<Chunk>;
    }

    createChunk(index: Vector3D): Chunk {
        const chunkPosition = <Vector3D>multiply(CHUNK_SIZE * BLOCK_SIZE, index);
        const id = getChunkId(index);
        return new Chunk(id, this.stage, this, chunkPosition);
    }

    update(delta) { }
}
