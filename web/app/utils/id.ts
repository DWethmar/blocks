import {Point3D} from "../types";

export const positionId = (c: Point3D) => c.join(".");

export const getChunkId = (position: Point3D) =>
    `chunk-${positionId(position)}`;

export const getBlockId = (position: Point3D) =>
    `block-${positionId(position)}`;
