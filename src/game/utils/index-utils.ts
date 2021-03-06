import { Point3D, createPoint } from '../../game/position/point';
import { floorPos } from '../../game/position/point-utils';
import { CHUNK_SIZE, BLOCK_SIZE } from '../../game/config';

export function convertWorldIndexToChunkIndex(worldIndex: Point3D): Point3D {
    return floorPos(
        createPoint(
            worldIndex.x / CHUNK_SIZE,
            worldIndex.y / CHUNK_SIZE,
            worldIndex.z / CHUNK_SIZE,
        ),
    );
}

export function convertPositionToChunkIndex(position: Point3D): Point3D {
    return floorPos(
        createPoint(
            position.x / (BLOCK_SIZE * CHUNK_SIZE),
            position.y / (BLOCK_SIZE * CHUNK_SIZE),
            position.z / (BLOCK_SIZE * CHUNK_SIZE),
        ),
    );
}

export function convertPositionToWorldIndex(position: Point3D): Point3D {
    return floorPos(
        createPoint(
            position.x / BLOCK_SIZE,
            position.y / BLOCK_SIZE,
            position.z / BLOCK_SIZE,
        ),
    );
}

export function convertWorldIndexToLocalIndex(worldIndex: Point3D): Point3D {
    return createPoint(
        worldIndex.x % CHUNK_SIZE,
        worldIndex.y % CHUNK_SIZE,
        worldIndex.z % CHUNK_SIZE,
    );
}
