import { GameObjectProperties } from '../game-object/game-object-properties';
import { BlockType } from './block-type';

export interface BlockProperties extends GameObjectProperties {
    type: BlockType;
}
