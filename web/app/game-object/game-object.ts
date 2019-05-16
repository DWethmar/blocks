import { Point3D } from '../position/point';

export interface GameObject {
    id: string;
    position: Point3D;
    views: PIXI.Container[];
}
