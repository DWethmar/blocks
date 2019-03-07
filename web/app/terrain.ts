import * as PIXI from "pixi.js";
import {Chunk, chunkDivider} from "./chunk";
import {Vector3D} from "./types";
import {Block} from "./block";
import {multiply} from "./utils/calc";
import {BLOCK_SIZE, CHUNK_SIZE} from "./config";
import {addPos, getX, getY, getZ, isEqual} from "./utils/position";
import {getBlockId, getChunkId} from "./utils/id";
import {GameObject} from "./game-object";
import {Scene} from "./scene";
import {AddBlock, TerrainActionTypes} from "./actions/terrain-actions";
import {filter, map, switchMap, take, tap} from "rxjs/operators";
import {AddGameObject} from "./actions/game-objects";
import {Observable, zip} from "rxjs";

export class Terrain extends GameObject {


    constructor(
        readonly stage: PIXI.Container,
        readonly scene: Scene,
    ) {
        super('terrain', [0, 0, 0]);

        this.scene.listen(TerrainActionTypes.ADD_BLOCK)
            .pipe(
                tap(() => console.log(':D')),
                switchMap((action: AddBlock) => this.addBlock(action.payload.block))
            )
            .subscribe((chunk) => {
                console.log(`Added block to chunk`, chunk);
            });

        this.scene.listen(TerrainActionTypes.REMOVE_BLOCK)
            .pipe(
                tap(() => console.log(':D')),
                switchMap((action: AddBlock) => this.addBlock(action.payload.block))
            )
            .subscribe((chunk) => {
                console.log(`Added block to chunk`, chunk);
            });
    }

    /**
     * @param block The world position of the block.
     */
    private addBlock(block: Block): Observable<Chunk> {
        const blockPosition = block.worldIndex.point;
        const chunkIndex = <Vector3D>(
            chunkDivider(CHUNK_SIZE * BLOCK_SIZE)(blockPosition)
        );

        return this.getChunk(chunkIndex).pipe(
            map(chunk => chunk ? chunk : this.createChunk(chunkIndex)),
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

    deleteBlock(index: Vector3D): Observable<Block | null> {
        const blockPosition = <Vector3D>multiply(BLOCK_SIZE, index);
        const chunkIndex = <Vector3D>(
            chunkDivider(CHUNK_SIZE * BLOCK_SIZE)(blockPosition)
        );
        return this.getChunk(chunkIndex).pipe(
            filter(chunk => !!chunk),
            take(1),
            map(chunk => chunk.removeBlock(index)),
        );
    }

    getChunk(chunkIndex: Vector3D): Observable<Chunk> {
        return this.scene.getGameObject<Chunk>(getChunkId(chunkIndex));
    }

    createChunk(index: Vector3D): Chunk {
        const chunkPosition = <Vector3D>multiply(CHUNK_SIZE * BLOCK_SIZE, index);
        const id = getChunkId(chunkPosition);
        const chunk = new Chunk(id, this.stage, this, chunkPosition);
        this.scene.emit(new AddGameObject({ gameObject: chunk}));
        return chunk;
    }

    // triggerSurroundingChunk(chunkIndex: Vector3D, blockIndex: Vector3D) {
    //     // update chunks around it
    //     [
    //         addPos(chunkIndex, [1, 0, 0]), // right
    //         addPos(chunkIndex, [-1, 0, 0]), // left
    //         addPos(chunkIndex, [0, -1, 0]), // back
    //         addPos(chunkIndex, [0, 1, 0]), // front
    //     ].forEach(index => {
    //         this.hasChunk(index) ? this.getChunk(index).hasChanged = true : null;
    //     });
    // }

    update(delta) {

    }

}

// export const createChunkSelector = (terrain: Terrain) => (
//     chunkPosition: Vector3D
// ) => (terrain.hasChunk(chunkPosition) ? terrain.getChunk(chunkPosition) : null);
