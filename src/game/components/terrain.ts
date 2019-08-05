import { Point3D } from '../position/point';
import { BlockType } from '../block/block-type';

export interface TerrainComponent {
    chunks: {
        [chunkPosition: string]: string; // chunkPosId -> chunk gameobjectid
    };
    blockQueue: {
        blockWorldIndex: Point3D;
        type: BlockType;
    }[];
}
