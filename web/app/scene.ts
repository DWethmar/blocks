import {GameObject} from "./game-object";
import {BehaviorSubject, combineLatest, Observable, of, Subject} from "rxjs";
import {GameAction} from "./actions/game-action";
import {filter, pluck, switchMap, tap, withLatestFrom} from "rxjs/operators";

export interface SceneState {
    gameObjects:            { [id: string]: GameObject },
    activeGameObjects:      string[]
}

export class Scene {

    private state = new BehaviorSubject<SceneState>({
        gameObjects: {},
        activeGameObjects: []
    });

    private events = new BehaviorSubject<GameAction>(null);

    emit(event: GameAction): void {
        this.events.next(event);
    }

    update(gameState: SceneState): void {
        this.state.next(gameState);
    }

    listen(actionType: string): Observable<GameAction> {
        return this.events.pipe(
            filter(action => !!action && action.type === actionType),
        );
    }

    getState() {
        return this.state;
    }

    getGameObject<T extends GameObject>(id: string): Observable<T> {
        return this.state.pipe(
            filter(state => !!state
                && Object.entries(state.gameObjects).length === 0
                && state.gameObjects.constructor === Object),
            pluck(id)
        )
    }
}

