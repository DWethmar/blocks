import { GameComponent } from './game-component';

export class GameComponentRepository {
    public gameComponents: { [name: string]: GameComponent };

    public constructor() {
        this.gameComponents = {};
    }

    public getById(id: string): GameComponent {
        if (this.has(id)) {
            return this.gameComponents[id];
        }
        return null;
    }

    public provide(gameComponent: GameComponent): void {
        this.gameComponents[gameComponent.name] = gameComponent;
    }

    public has(name: string): boolean {
        return this.gameComponents.hasOwnProperty(name);
    }
}
