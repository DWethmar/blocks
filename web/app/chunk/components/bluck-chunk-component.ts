import * as PIXI from 'pixi.js';
import { GameScene } from '../scene/game-scene';
import { Chunk } from './chunk';
import { GameComponent } from '../game-component/game-component';

const filters: {
    [id: string]: PIXI.filters.BlurFilterPass;
} = {};

export const blurChunk: GameComponent = (
    scene: GameScene,
    chunk: Chunk,
): void => {
    if (!filters[chunk.id]) {
        filters[chunk.id] = new PIXI.filters.BlurFilter();
    }
};
