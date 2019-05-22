import * as PIXI from 'pixi.js';

export interface LoadAssetParams {
    name: string;
    asset: any;
}

export class AssetRepository {
    public textures: { [name: string]: PIXI.Texture };

    public spritesheet: PIXI.Spritesheet;

    public constructor() {
        this.textures = {};
    }

    public loadSpriteSheet(data: any, image: string): Promise<boolean> {
        return new Promise<boolean>(
            (resolve, reject): void => {
                const baseTexture = new PIXI.BaseTexture(image);
                this.spritesheet = new PIXI.Spritesheet(baseTexture, data);
                this.spritesheet.parse(() => {
                    resolve();
                });
            },
        );
    }
}
