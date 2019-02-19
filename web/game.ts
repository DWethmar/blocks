import {GameObject} from "./game-object";

export interface GameState {
    gameObjects: { [id: string]: GameObject }
}

export function createGameState(): GameState {
    return {
        gameObjects: {}
    }
}
