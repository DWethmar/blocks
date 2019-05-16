function createCellId(x: number, y: number): string {
    return `${x}.${y}`;
}

export class Cell {
    public id = '';
    public x: number;
    public y: number;

    public constructor(x: number, y: number) {
        this.id = createCellId(x, y);
        this.x = x;
        this.y = y;
    }
}

export class GameOfLife {
    private cells: Map<string, Cell> = new Map();
    private width: number;
    private height: number;
    public constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    public addRandomCells(amount: number): void {
        for (let i = 0; i < amount; i++) {
            const cell = new Cell(Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height));
            this.cells.set(cell.id, cell);
        }
    }

    public tick(): void {
        const newCells = new Map<string, Cell>();

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                // is alive?
                let alive = newCells.has(createCellId(x, y));
                const l = this.hasNeighbors(x, y);

                const n = Object.values(l).filter(c => c).length;
                if (n === 2 || n === 3) {
                    const cell = new Cell(x, y);
                    newCells.set(cell.id, cell);
                }
            }
        }
        this.cells = newCells;
    }

    public hasNeighbors(x: number, y: number): { [pos: string]: boolean } {
        return {
            top: this.cells.has(createCellId(x, y - 1)),
            topRight: this.cells.has(createCellId(x + 1, y - 1)),
            right: this.cells.has(createCellId(x + 1, y)),
            bottomRight: this.cells.has(createCellId(x + 1, y + 1)),
            bottom: this.cells.has(createCellId(x, y + 1)),
            bottomLeft: this.cells.has(createCellId(x - 1, y - 1)),
            left: this.cells.has(createCellId(x - 1, y)),
            topLeft: this.cells.has(createCellId(x - 1, y + 1)),
        };
    }

    public getCells(): Cell[] {
        return Array.from(this.cells.values());
    }
}
