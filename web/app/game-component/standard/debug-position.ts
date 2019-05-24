import * as PIXI from 'pixi.js';

import { Scene } from '../../scene/scene';
import { GameObject } from '../../game-object/game-object';
import { getDrawPosition } from '../../game-object/game-object-utils';

export function debugPosition(scene: Scene, gameObject: GameObject): void {
    let debugPositionView: PIXI.Text = null;
    if (!(gameObject as any).debugPositionView) {
        (gameObject as any).debugPositionView = new PIXI.Text('~', {
            fontFamily: 'Consolas',
            fontSize: 12,
            fill: 0xff1010,
        });
        scene.stage.addChild((gameObject as any).debugPositionView);
    }
    debugPositionView = (gameObject as any).debugPositionView;
    const [drawX, drawY, zIndex] = getDrawPosition(gameObject.position);
    debugPositionView.position.set(drawX, drawY);
    debugPositionView.zIndex = zIndex;
    debugPositionView.text = `x${gameObject.position.x.toFixed(
        2,
    )}y${gameObject.position.y.toFixed(2)}z${gameObject.position.z.toFixed(2)}`;
}
