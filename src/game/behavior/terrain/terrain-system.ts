import * as PIXI from 'pixi.js';

import { Engine } from '../../engine/engine';
import { System } from '../../engine/system';
import { Components } from '../../components/components';
import { Component } from '../../components/component';
import { TerrainComponent } from './terrain-component';

export class TerrainSystem extends System {
    public constructor() {
        super();
    }

    public update(engine: Engine, delta: number): void {
        engine
            .getAllComponents(Components.TERRAIN)
            .forEach((c: Component<TerrainComponent>) => {
                this.updateTerrain(engine, c);
            });
    }

    public updateTerrain(
        engine: Engine,
        terrain: Component<TerrainComponent>,
    ): void {}
}
