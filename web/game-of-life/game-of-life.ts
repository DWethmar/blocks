function createCellId(x: number, y: number) {
    return `${x}.${y}`;
}

export class Cell {
    public id = "";

    constructor(public x: number, public y: number) {
        this.id = createCellId(x, y);
    }
}

export class GameOfLife {
    private cells: Map<string, Cell> = new Map();

    constructor(private width: number, private height: number) {
    }

    addRandomCells(amount: number) {
        for (let i = 0; i < amount; i++) {
            const cell = new Cell(
                Math.floor((Math.random() * this.width)),
                Math.floor((Math.random() * this.height))
            );
            this.cells.set(cell.id, cell);
        }
    }

    tick() {
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

    hasNeighbors(x: number, y: number): { [pos: string]: boolean } {
        return {
            top: this.cells.has(createCellId(x, y - 1)),
            topRight: this.cells.has(createCellId(x + 1, y - 1)),
            right: this.cells.has(createCellId(x + 1, y)),
            bottomRight: this.cells.has(createCellId(x + 1, y + 1)),
            bottom: this.cells.has(createCellId(x, y + 1)),
            bottomLeft: this.cells.has(createCellId(x - 1, y - 1)),
            left: this.cells.has(createCellId(x - 1, y)),
            topLeft: this.cells.has(createCellId(x - 1, y + 1))
        };
    }

    getCells() {
        return Array.from(this.cells.values());
    }
}
