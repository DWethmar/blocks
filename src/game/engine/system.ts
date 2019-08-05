import { Engine } from './engine';

export abstract class System {
    abstract update(engine: Engine, delta: number): void;
}
