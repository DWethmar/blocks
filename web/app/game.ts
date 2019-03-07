import {GameObject} from "./game-object";
import {BehaviorSubject, Observable, of} from "rxjs";
import {GameAction} from "./actions/game-action";
import {filter, tap, withLatestFrom} from "rxjs/operators";

export interface GameState {
    gameObjects:    { [id: string]: GameObject },
}

export class Game {

    private state = new BehaviorSubject<GameState>({
        gameObjects: {}
    });

    private events = new BehaviorSubject<GameAction>(undefined);

    emit(event: GameAction): void {
        this.events.next(event);
    }

    update(gameState: GameState): void {
        this.state.next(gameState);
    }

    createEffect(actionType: string) {
        return this.events.pipe(
            filter(action => action.type === actionType),
            withLatestFrom(this.state),
            // tap(([event, state]: [GameAction, GameState]) => {
            //     console.log()
            // })
        );
    }
}

