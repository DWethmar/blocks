import { BlockType } from './block-type';

export function isBlockTransparent(type: BlockType): boolean {
    return type === BlockType.AIR;
}
