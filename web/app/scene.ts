import {GameObject} from "./game-object";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {GameAction} from "./actions/game-action";
import {filter, map, pluck, tap} from "rxjs/operators";

export interface SceneState {
    gameObjects:            { [id: string]: GameObject },
    activeGameObjects:      string[]
}

export class Scene {

    private state = new BehaviorSubject<SceneState>({
        gameObjects: {},
        activeGameObjects: []
    });

    private events = new Subject<any>();

    emit(event: GameAction): void {
        this.events.next(event);
    }

    update(gameState: SceneState): void {
        this.state.next(gameState);
    }

    listen<T extends GameAction>(actionType: string): Observable<T> {
        return this.events.pipe(
            filter(action => action.type === actionType)
        );
    }

    getState(): Observable<SceneState> {
        return this.state;
    }

    getGameObject(id: string): Observable<GameObject> {
        return this.state.pipe(
            map(state => state.gameObjects),
            pluck(id),
        )
    }
}

