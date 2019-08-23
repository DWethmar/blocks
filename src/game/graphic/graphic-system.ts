import * as PIXI from 'pixi.js';
import { System } from '../engine/system';
import { Engine } from '../engine/engine';
import { Components } from '../components/components';
import { createCircleGraphic } from './circle';
import { pink } from '../color/colors';
import { getDrawPosition } from '../utils/game-object-utils';
import { Point3D } from '../position/point';
import { GraphicComponent } from './graphic-component';
import { Component } from '../components/component';

export class GraphicSystem extends System {
    private readonly stage: PIXI.Container;

    public constructor(stage: PIXI.Container) {
        super();
        this.stage = stage;
    }

    public update(engine: Engine, delta: number): void {
        engine
            .getAllComponents(Components.VIEW)
            .forEach((c: Component<GraphicComponent>) => {
                const position = engine.getComponent<Point3D>(
                    c.gameObjectId,
                    Components.POSITION,
                );
                if (position) {
                    const [drawX, drawY, zIndex] = getDrawPosition(
                        position.state,
                    );

                    let view: PIXI.Container = this.stage.getChildByName(
                        c.id,
                    ) as PIXI.Container;

                    if (!view) {
                        view = new PIXI.Container();
                        view.name = c.id;
                        view.x = drawX * delta;
                        view.y = drawY * delta;

                        // TODO split up somewhere else.
                        switch (c.state.name) {
                            case 'ball':
                                view.addChild(
                                    createCircleGraphic(-2.5, -2.5, 5, pink),
                                );
                                break;
                        }
                        this.stage.addChild(view);
                    }
                    view.position.set(drawX, drawY);
                    view.zIndex = zIndex;
                }
            });
    }
}
