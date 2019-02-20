import {GameObject} from "./game-object";

export interface GameState {
    gameObjects:    { [id: string]: GameObject },
    textures:       { [id: string]: PIXI.Texture }
}

export function createGameState(): GameState {
    return {
        gameObjects: {},
        textures: {}
    }
}

