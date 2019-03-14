import {Point3D} from "../position/point";
import {positionId} from "../position/point-utils";

export const getBlockId = (position: Point3D) =>
    `block-${positionId(position)}`;
