import { GameObjectRepository } from '../game-object/game-object-repository';
import { GameComponentRepository } from '../game-component/game-component-repository';
import { AssetRepository } from '../assets/asset-repository';

export abstract class Scene {
    public gameObjects: GameObjectRepository;
    public gameComponents: GameComponentRepository;
    public assets: AssetRepository;

    public assetsLoading = 0;
    public assetsLoaded = 0;

    public stage: PIXI.Container;

    public delta = 0;

    public constructor() {
        this.gameComponents = new GameComponentRepository();
        this.gameObjects = new GameObjectRepository();
        this.assets = new AssetRepository();
    }

    abstract update(delta: number);
}
