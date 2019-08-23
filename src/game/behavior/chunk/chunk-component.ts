import { blockRepository } from '../block/block-repository';

export interface ChunkComponent {
    blocks: blockRepository;
    terrainId: string;
    hasChanged: boolean;
}
