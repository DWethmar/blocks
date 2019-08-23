import { Engine } from './engine';

export abstract class System {
    public onAttach(engine: Engine): void {}
    abstract update(engine: Engine, delta: number): void;
}
