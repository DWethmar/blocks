import { Scene } from '../scene/scene';
import { GameObject } from '../game-object/game-object';

export type GameComponent = (scene: Scene, gameObject: GameObject) => void;
