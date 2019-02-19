import {Vector3D} from "../types";

export const positionId = (c: Vector3D) => c.join(".");

export const getChunkId = (position: Vector3D) =>
    `chunk-${positionId(position)}`;

export const getBlockId = (position: Vector3D) =>
    `block-${positionId(position)}`;
