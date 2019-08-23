import * as PIXI from 'pixi.js';

import { Engine } from '../../engine/engine';
import { System } from '../../engine/system';
import { Components } from '../../components/components';
import { Component } from '../../components/component';
import { DebugLabelComponent } from './debug-label-component';
import { Point3D } from '../../position/point';
import { getDrawPosition } from '../../utils/game-object-utils';

export class DebugLabelSystem extends System {
    private readonly stage: PIXI.Container;

    public constructor(stage: PIXI.Container) {
        super();
        this.stage = stage;
    }

    public update(engine: Engine, delta: number): void {
        engine
            .getAllComponents(Components.DEBUG_LABEL)
            .forEach(
                (c: Component<DebugLabelComponent>) =>
                    void this.updateDebugLabel(engine, c, delta),
            );
    }

    private updateDebugLabel(
        engine: Engine,
        c: Component<DebugLabelComponent>,
        delta: number,
    ): void {
        const position = engine.getComponent<Point3D>(
            c.gameObjectId,
            Components.POSITION,
        );
        if (position) {
            const viewName = `${c.id}-debug-label`;
            let view: PIXI.Text = this.stage.getChildByName(
                viewName,
            ) as PIXI.Text;

            if (!view) {
                view = new PIXI.Text('~', {
                    fontFamily: 'Ariel',
                    fontSize: 14,
                    fill: 0xff1010,
                    stroke: '#000',
                    strokeThickness: 2,
                });
                view.name = viewName;
                this.stage.addChild(view);
            }
            const [drawX, drawY] = getDrawPosition(position.state);

            view.position.set(drawX, drawY);
            view.zIndex = position.state.z + 999999;
            view.text = `X:${position.state.x.toFixed(
                1,
            )}Y:${position.state.y.toFixed(1)}Z:${position.state.z.toFixed(1)}`;
        }
    }
}
