import { Chunk } from './chunk';
import { CHUNK_SIZE } from '../config';
import {
    getBlock,
    iterateBlocks,
    blockRepository,
} from '../block/block-repository';
import { isBlockTransparent } from '../block/block';
import { BlockType } from '../block/block-type';
import { convertPositionToChunkIndex } from '../terrain/index-utils';
import { Point3D, createPoint } from '../position/point';
import {
    isWithin,
    minusPos,
    addPos,
    positionId,
} from '../position/point-utils';

export function getChunkId(chunkIndex: Point3D): string {
    return `chunk-${positionId(chunkIndex)}`;
}
