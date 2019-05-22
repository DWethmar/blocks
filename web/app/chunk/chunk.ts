import * as PIXI from 'pixi.js';

import { GameObject } from '../game-object/game-object';
import { Point3D } from '../position/point';
import { CHUNK_SIZE, BLOCK_SIZE } from '../config';
import { multiply } from '../calc/calc';
import {
    isPositionWithinChunk,
    getVisibleBlocksIndexes as calculateVisibleBlocksIndexes,
} from './chunk-utils';
import { sortZYXAsc } from '../calc/sort';
import {
    convertWorldIndexToLocalIndex,
    convertPositionToChunkIndex,
    addPos,
} from '../position/point-utils';
import { Terrain } from '../terrain/terrain';
import { BlockType } from '../block/block-type';
import {
    createBlockRepository,
    blockRepository,
    getBlock,
    iterateBlocks,
} from '../block/block-repository';
import { GameScene } from '../scene/game-scene';
import {
    grey,
    green,
    red,
    pink,
    greyDarken1,
    greenDarken1,
    pinkDarken1,
    redDarken1,
} from '../color/colors';

export interface Chunk extends GameObject {
    blocks: blockRepository;
    views: PIXI.Container[];
    terrain: Terrain;
    hasChanged: boolean;
}

function createBlockGetter(
    chunk: Chunk,
    terrain: Terrain,
): (localIndex: Point3D) => BlockType {
    return function(localIndex: Point3D) {
        const chunkIndex = convertPositionToChunkIndex(chunk.position);
        if (isPositionWithinChunk(localIndex, chunkIndex)) {
            return getBlock(localIndex, chunk.blocks);
        }
        return null;
    };
}

export function updateChunk(scene: GameScene, chunk: Chunk): void {
    if (!chunk.hasChanged) {
        return;
    }
    // Calculate which blocks are visible.
    const blocksToRender = calculateVisibleBlocksIndexes(chunk);

    // | Render all blocks from this chunk |
    // const blocksToRender = Array.from(iterateBlocks(chunk.blocks))
    //     .filter(
    //         ([, blockType]: [Point3D, BlockType]) =>
    //             blockType !== BlockType.AIR,
    //     )
    //     .map(([point, blockType]: [Point3D, BlockType]) => point);

    blocksToRender.sort(
        (idA, idB): number => {
            return sortZYXAsc(idA, idB);
        },
    );

    const blockLayers: PIXI.Container[] = [];

    // Clear that shit.
    chunk.views.forEach((l): void => void l.destroy({ children: true }));

    blocksToRender.forEach(
        (localIndex): void => {
            const blockType = getBlock(localIndex, chunk.blocks);

            const blockPosition = multiply(BLOCK_SIZE, localIndex);

            const index = blockPosition.y;
            let layer = blockLayers[index];

            if (!blockLayers[index]) {
                layer = new PIXI.Container();
                layer.sortableChildren = false;
                layer.position.set(chunk.position.x, chunk.position.y);
                layer.name = `BlockLayer: ${chunk.position.x} ${
                    chunk.position.y
                } ${chunk.position.z}`;
                blockLayers[index] = layer;

                chunk.views[index] = layer;
                scene.stage.addChild(layer);
            }

            const drawX = localIndex.x * BLOCK_SIZE;
            const drawY =
                localIndex.y * BLOCK_SIZE -
                localIndex.z * BLOCK_SIZE +
                BLOCK_SIZE * CHUNK_SIZE;

            let frontColor = null;
            // Front
            switch (blockType) {
                case BlockType.ROCK:
                    frontColor = grey;
                    break;
                case BlockType.GRASS:
                    frontColor = green;
                    break;
                case BlockType.SELECTION:
                    frontColor = red;
                    break;
                default:
                    frontColor = pink;
                    break;
            }
            const spriteFront = new PIXI.Sprite(PIXI.Texture.WHITE);
            spriteFront.tint = frontColor;
            spriteFront.width = spriteFront.height = BLOCK_SIZE;
            spriteFront.position.set(drawX, drawY);
            layer.addChild(spriteFront);

            let topColor = null;
            // Top
            switch (blockType) {
                case BlockType.ROCK:
                    topColor = greyDarken1;
                    break;
                case BlockType.GRASS:
                    topColor = greenDarken1;
                    break;
                case BlockType.SELECTION:
                    topColor = redDarken1;
                    break;
                default:
                    topColor = pinkDarken1;
                    break;
            }
            const spriteTop = new PIXI.Sprite(PIXI.Texture.WHITE);
            spriteTop.tint = topColor;
            spriteTop.width = spriteTop.height = BLOCK_SIZE;
            spriteTop.position.set(drawX, drawY - BLOCK_SIZE);
            layer.addChild(spriteTop);
        },
    );

    chunk.views = blockLayers;
    chunk.hasChanged = false;
}

export function createChunk(id: string, position: Point3D): Chunk {
    return {
        id: id,
        position: position,
        blocks: createBlockRepository(CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE),
        views: [],
        terrain: null,
        hasChanged: true,
        components: [updateChunk.name],
    };
}
