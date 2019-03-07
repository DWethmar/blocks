import { GameAction } from "./game-action";
import {Block} from "../block";

export enum TerrainActionTypes {
    ADD_BLOCK = '[terrain] Add Block',
    REMOVE_BLOCK = '[terrain] Remove Block',
}

export class AddBlock implements GameAction {
    readonly type = TerrainActionTypes.ADD_BLOCK;

    constructor(public payload: { block: Block }) {}
}

export class RemoveBlock implements GameAction {
    readonly type = TerrainActionTypes.REMOVE_BLOCK;

    constructor(public payload: { block: Block }) {}
}
