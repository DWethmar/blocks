import * as PIXI from 'pixi.js';

import { Engine } from '../../engine/engine';
import { System } from '../../engine/system';
import { Components } from '../../components/components';
import { Component } from '../../components/component';
import { TerrainComponent } from './terrain-component';
import { createBlockSetter } from './terrain';

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
    ): void {
        const blockSetter = createBlockSetter(terrain.gameObjectId, engine)

        terrain.state.blockQueue.forEach(q => void blockSetter(q.blockWorldIndex, q.type));
        terrain.state.blockQueue = [];
        engine.updateComponent(terrain.id, terrain.state);
    }
}
