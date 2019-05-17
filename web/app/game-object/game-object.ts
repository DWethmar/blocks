import { Point3D } from '../position/point';
import { Scene } from '../scene/scene';

export interface GameObject {
    id: string;
    position: Point3D;
    update?(gameObject: GameObject, scene: Scene): void;
    setup?(gameObject: GameObject, scene: Scene): void;
}
