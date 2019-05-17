import { GameObject } from "./game-object";
import { Scene } from "../scene/scene";

export type GameObjectHandler = (gameObject: GameObject, scene: Scene) => void;
