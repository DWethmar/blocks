import * as PIXI from 'pixi.js';

export interface LoadAssetParams {
    name: string;
    asset: any;
}

export class AssetRepository {
    public textures: { [name: string]: PIXI.Texture };

    public constructor() {
        this.textures = {};
    }

    public loadSpriteSheet(url: string): Promise<boolean> {
        return new Promise<boolean>(
            (resolve, reject): void => {
                const baseTexture = new PIXI.BaseTexture(image);
                const spritesheet = new PIXI.Spritesheet(baseTexture, data);
                spritesheet.parse(function(textures): void {
                    this.textures = {
                        ...this.textures,
                        ...textures,
                    };
                    resolve(true);
                });
            },
        );
    }

    public registerAsset(name: string, asset: any): void {
        this.assets[name] = asset;
    }
}
