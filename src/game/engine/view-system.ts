import * as PIXI from 'pixi.js';

import { Engine } from './engine';
import { System } from './system';
import { Components } from '../components/components';
import { ViewComponent } from '../components/view';
import { Component } from '../components/component';
import { getDrawPosition } from '../utils/game-object-utils';
import { Point3D } from '../position/point';
import { createCircleGraphic } from '../graphics/circle';
import { pink } from '../color/colors';

export class ViewSystem extends System {
    private readonly stage: PIXI.Container;

    public constructor(stage: PIXI.Container) {
        super();
        this.stage = stage;
    }

    public update(engine: Engine, delta: number): void {
        engine
            .getAllComponents(Components.VIEW)
            .forEach((c: Component<ViewComponent>) => {
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
                        view.x = drawX;
                        view.y = drawY;

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
