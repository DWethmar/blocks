import * as PIXI from "pixi.js";
import {GameObject} from "../game-object/game-object";
import {Scene} from "../scene/scene";
import {Point3D} from "../position/point";
import {Block} from "../block/block";
import {BLOCK_SIZE, CHUNK_SIZE} from "../config";
import {multiply} from "../calc/calc";
import {Chunk, chunkDivider} from "../chunk/chunk";
import {BlockType} from "../block/block-type";
import {getChunkId} from "../chunk/chunk-utils";

export class Terrain extends GameObject {

    constructor(
        readonly stage: PIXI.Container,
        readonly scene: Scene,
    ) {
        super('terrain', [0, 0, 0]);
    }

    /**
     * @param blockIndex The world position of the block.
     * @param type
     */
    addBlock(blockIndex: Point3D, type: BlockType) {
        const blockPosition = <Point3D>multiply(BLOCK_SIZE, blockIndex);
        const block = new Block( type, blockPosition);

        let chunk = this.getChunk(block.chunkIndex.point);
        if (!chunk) {
            chunk = this.createChunk(block.chunkIndex.point);
        }
        chunk.addBlock(block);
    }

    getBlock(worldPosition: Point3D): Block {
        const blockPosition = <Point3D>multiply(BLOCK_SIZE, worldPosition);
        const chunkIndex = <Point3D>(
            chunkDivider(CHUNK_SIZE * BLOCK_SIZE)(blockPosition)
        );
        const chunk = this.getChunk(chunkIndex);
        if (chunk) {
            return chunk.isEmpty(worldPosition)
                ? (<Block>chunk.getBlock(worldPosition))
                : new Block(BlockType.AIR, worldPosition);
        }
        return null;
    }

    hasChunk(chunkIndex: Point3D): boolean {
        return this.scene.gameObjectRepository.hasGameObject(getChunkId(chunkIndex));
    }

    getChunk(chunkPosition: Point3D): Chunk | null {
        const chunkId = getChunkId(chunkPosition);
        if (this.scene.gameObjectRepository.hasGameObject(chunkId)) {
            return (<Chunk>this.scene.gameObjectRepository.getGameObject(chunkId));
        }
        return null;
    }

    createChunk(index: Point3D): Chunk {
        const chunkPosition = <Point3D>multiply(CHUNK_SIZE * BLOCK_SIZE, index);
        const chunk = new Chunk(
            getChunkId(index),
            this.stage,
            this,
            chunkPosition
        );
        this.scene.gameObjectRepository.setGameObject(chunk);
        this.scene.activeGameObjects.push(chunk.id);

        console.log(
            `Created Chunk with id: ${getChunkId(
                chunk.chunkIndex.point
            )} for position: ${chunk.chunkIndex.point}`
        );

        return chunk;
    }

    update(delta) { }
}
