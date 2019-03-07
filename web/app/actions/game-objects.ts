import { GameAction } from "./game-action";
import {GameObject} from "../game-object";


export enum FilesActionTypes {
    ADD_GAME_OBJECT = '[Files] Load file',
}

export class AddGameObject implements GameAction {
    readonly type = FilesActionTypes.ADD_GAME_OBJECT;

    constructor(public payload: { gameObject: GameObject }) {}
}
