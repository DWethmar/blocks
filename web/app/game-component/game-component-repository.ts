import { GameComponent } from './game-component';

export class GameComponentRepository {
    public gameComponents: { [name: string]: GameComponent };

    public constructor() {
        this.gameComponents = {};
    }

    public getGameComponentById(id: string): GameComponent {
        if (this.hasGameComponent(id)) {
            return this.gameComponents[id];
        }
        return null;
    }

    public provideGameComponent(gameComponent: GameComponent): void {
        this.gameComponents[gameComponent.name] = gameComponent;
    }

    public hasGameComponent(name: string): boolean {
        return this.gameComponents.hasOwnProperty(name);
    }
}
