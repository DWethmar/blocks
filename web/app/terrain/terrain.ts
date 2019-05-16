import * as PIXI from 'pixi.js';
import { GameObject } from '../game-object/game-object';
import { Scene } from '../scene/scene';
import { Point3D, getStartPoint, createPoint } from '../position/point';
import { Block } from '../block/block';
import { BLOCK_SIZE, CHUNK_SIZE } from '../config';
import { multiply } from '../calc/calc';
import { Chunk, chunkDivider } from '../chunk/chunk';
import { BlockType } from '../block/block-type';
import { getChunkId } from '../chunk/chunk-utils';
import { addPos } from '../position/point-utils';
import { BlockIndex } from '../position/block-index';

export class Terrain extends GameObject {
    private readonly stage: PIXI.Container;
    private readonly scene: Scene;

    public constructor(stage: PIXI.Container, scene: Scene) {
        super('terrain', getStartPoint());
        this.stage = stage;
        this.scene = scene;
        // this.stage.interactive = true;
        //
        // this.stage.on("click", (event) => {
        //     this.click(event.data.global);
        // });
        //
        // this.stage.on("mousemove", (event) => {
        //     this.mousemove(event.data.global);
        // });
    }

    private mousemove(p: PIXI.Point): void {
        console.log('CLICKED');
        const x = p.x;
        let y = 0;
        let z = 0;

        // if (p.y > this.bounds.height / 2) {
        //     // click on front
        //     z = ((CHUNK_SIZE * BLOCK_SIZE) * 2) - p.y;
        //     y = CHUNK_SIZE * BLOCK_SIZE;
        // } else {
        //     z = (CHUNK_SIZE * BLOCK_SIZE); // click on ceil
        //     y = ((CHUNK_SIZE * BLOCK_SIZE) * 2) - p.y
        // }
        //
        // const worldPos = <Point3D>(
        //     divideBy(BLOCK_SIZE, [x, y, z]).map(i => Math.floor(i))
        // );
        //
        // const dir = <Point3D>[0, -1, -1];
        // const hit = this.raycast(addPos(worldPos, dir), dir);
        //
        // if (hit) {
        //     console.log(
        //         this.addBlock(addPos(hit.vector3D, [0, 0, BLOCK_SIZE]), BlockType.VOID)
        //     );
        // }
    }

    private click(p: PIXI.Point): void {
        const x = p.x;
        let y = p.y;
        let z = 0;

        const lowerHalve = p.y > this.stage.height / 2;

        console.log('CLICKED', x, y, lowerHalve);

        const position: Point3D = {
            x,
            y,
            z: this.position.z + (CHUNK_SIZE + BLOCK_SIZE),
        };

        const blockIndex = new BlockIndex(position);

        const hit: Block = this.raycast(blockIndex.point, createPoint(0, -1, -1));

        if (hit) {
            this.addBlock(hit.position, BlockType.VOID);
        }
    }

    /**
     * @param blockIndex The world position of the block.
     * @param type
     */
    public addBlock(blockIndex: Point3D, type: BlockType): void {
        const blockPosition = multiply(BLOCK_SIZE, blockIndex);
        const block = new Block(type, blockPosition);

        let chunk = this.getChunk(block.chunkIndex.point);
        if (!chunk) {
            chunk = this.createChunk(block.chunkIndex.point);
        }
        chunk.addBlock(block);
    }

    public getBlock(worldPosition: Point3D): Block {
        const blockPosition = multiply(BLOCK_SIZE, worldPosition);
        const chunkIndex = chunkDivider(CHUNK_SIZE * BLOCK_SIZE)(blockPosition);
        const chunk = this.getChunk(chunkIndex);
        if (chunk) {
            return chunk.isEmpty(worldPosition)
                ? chunk.getBlock(worldPosition)
                : new Block(BlockType.AIR, worldPosition);
        }
        return null;
    }

    public hasBlock(blockIndex: Point3D): boolean {
        const chunkIndex = multiply(CHUNK_SIZE * BLOCK_SIZE, blockIndex);
        const chunk = this.getChunk(chunkIndex);
        if (chunk) {
            return chunk.isEmpty(blockIndex);
        }
        return null;
    }

    public hasChunk(chunkIndex: Point3D): boolean {
        return this.scene.gameObjectRepository.hasGameObject(getChunkId(chunkIndex));
    }

    public removeBlock(blockIndex: Point3D): void {
        let chunk = this.getChunk(blockIndex);
        if (chunk) {
            chunk.removeBlock(blockIndex);
        }
    }

    public getChunk(chunkPosition: Point3D): Chunk | null {
        const chunkId = getChunkId(chunkPosition);
        if (this.scene.gameObjectRepository.hasGameObject(chunkId)) {
            return this.scene.gameObjectRepository.getGameObject(chunkId) as Chunk;
        }
        return null;
    }

    public createChunk(index: Point3D): Chunk {
        const chunkPosition = multiply(CHUNK_SIZE * BLOCK_SIZE, index);
        const chunk = new Chunk(getChunkId(index), this.stage, this, chunkPosition);
        this.scene.gameObjectRepository.setGameObject(chunk);
        this.scene.gameObjectRepository.activateGameObject(chunk.id);

        console.log(
            `Created Chunk with id: ${getChunkId(chunk.chunkIndex.point)} for position: ${chunk.chunkIndex.point}`,
        );

        return chunk;
    }

    public raycast(start: Point3D, direction: Point3D): Block | null {
        const block = this.getBlock(start);

        if (block) {
            if (block.type !== BlockType.AIR) {
                return block;
            }
        } else {
            return null;
        }

        return this.raycast(addPos(start, direction), direction);
    }

    public update(delta: number): void {
        // @TODO
    }
}
