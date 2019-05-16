import { GameObjectRepository } from '../game-object/game-object-repository';

export interface LoadAssetParams {
    name: string;
    asset: any;
}

export abstract class Scene {
    public gameObjects: GameObjectRepository;

    public assetsLoading = 0;
    public assetsLoaded = 0;
    public assets: { [key: string]: any };

    public constructor() {
        this.gameObjects = new GameObjectRepository();
    }

    public loadAndRegisterAsset(load: Promise<LoadAssetParams>): void {
        this.assetsLoading++;
        load.then(
            (r): void => {
                this.assets[r.name] = r.asset;
                this.assetsLoaded++;
            },
        );
    }

    public registerAsset(name: string, asset: any): void {
        this.assets[name] = asset;
    }

    abstract update(delta: number);
}
