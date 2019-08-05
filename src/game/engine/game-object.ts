import { Point3D } from '../position/point';

export interface GameObject {
    id: string;
    name: string;
    components: {
        [componentType: string]: string; // componentType -> componentId
    };
}
