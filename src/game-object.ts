import {Vector3D} from "./types";
import {getX, getY, getZ} from "./utils/position";

export abstract class GameObject {
  // Position
  get x() {
    return getX(this.position);
  }
  set x(value: number) {
    this.position[0] = value;
  }

  get y() {
    return getY(this.position);
  }
  set y(value: number) {
    this.position[1] = value;
  }

  get z() {
    return getZ(this.position);
  }
  set z(value: number) {
    this.position[2] = value;
  }

  // Direction
  get dX() {
    return getX(this.direction);
  }
  set dX(value: number) {
    this.direction[0] = value;
  }

  get dY() {
    return getY(this.direction);
  }
  set dY(value: number) {
    this.direction[1] = value;
  }

  get dZ() {
    return getZ(this.direction);
  }
  set dZ(value: number) {
    this.direction[2] = value;
  }

  constructor(
    public position: Vector3D,
    public direction: Vector3D = [0, 0, 0]
  ) {}

  abstract update(delta): void;
}
