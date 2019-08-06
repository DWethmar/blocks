import { BlockType } from '../block/block-type';
import { Point3D } from '../position/point';

export interface TerrainComponent {
    chunks: {
        [chunkPosition: string]: string; // chunkPosId -> chunk gameobjectid
    };
    blockQueue: {
        blockWorldIndex: Point3D;
        type: BlockType;
    }[];
}
