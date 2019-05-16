import { Point3D } from '../position/point';
import { GameObjectProperties } from './game-object-properties';

export abstract class GameObject {
    public id: string;
    public position: Point3D = null;

    public constructor(props: GameObjectProperties) {
        this.id = props.id;
        this.position = props.position;
    }

    abstract update(delta): void;
}
