import {Chunk} from "./chunk";

export type Point3D = [number, number, number]; // getX getY getZ

export type chunkSelector = (chunkPosition: Point3D) => Chunk;

export type viewPort = {
    width: number;
    height: number;
};

export interface LoadProgress {
    total: number;
    done: number;
}
