import { GameAction } from "./game-action";
import {GameObject} from "../game-object";


export enum GameObjectActionTypes {
    ADD_GAME_OBJECT = '[Files] Load file',
}

export class AddGameObject implements GameAction {
    readonly type = GameObjectActionTypes.ADD_GAME_OBJECT;

    constructor(public payload: { gameObject: GameObject }) {}
}
