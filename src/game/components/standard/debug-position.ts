import * as PIXI from 'pixi.js';

import { getDrawPosition } from '../../utils/game-object-utils';
import { GameScene } from '../../scene/game-scene';
import { GameObject } from '../../game-object/game-object';

export function debugPosition(scene: GameScene, gameObject: GameObject): void {
    let debugPositionView: PIXI.Text = null;
    if (!(gameObject as any).debugPositionView) {
        (gameObject as any).debugPositionView = new PIXI.Text('~', {
            fontFamily: 'Ariel',
            fontSize: 14,
            fill: 0xff1010,
            stroke: '#000',
            strokeThickness: 2,
        });
        scene.stage.addChild((gameObject as any).debugPositionView);
    }
    debugPositionView = (gameObject as any).debugPositionView;
    const [drawX, drawY] = getDrawPosition(gameObject.position);
    debugPositionView.position.set(drawX, drawY);
    debugPositionView.zIndex = gameObject.position.z + 999999;
    debugPositionView.text = `X:${gameObject.position.x.toFixed(
        2,
    )}Y:${gameObject.position.y.toFixed(2)}Z:${gameObject.position.z.toFixed(
        2,
    )}`;
}
