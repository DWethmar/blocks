import { Scene } from '../scene/scene';
import { GameObject } from '../game-object/game-object';

export type GameComponent = (gameObject: GameObject, scene: Scene) => void;
