import {Chunk} from "./chunk";

export type Vector3D = [number, number, number]; // getX getY getZ

export type chunkSelector = (chunkPosition: Vector3D) => Chunk;

export type viewPort = {
    width: number;
    height: number;
};
