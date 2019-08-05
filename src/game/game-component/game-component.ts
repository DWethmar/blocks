import { Scene } from '../scene/scene';
import { GameObject } from '../engine/game-object';

export type GameComponent = (scene: Scene, gameObject: GameObject) => void;
