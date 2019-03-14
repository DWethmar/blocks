export function divideBy(divisor: number, i: number[]): number[] {
    return i.map(x => x / divisor);
}

export function add(addition: number, i: number[]): number[] {
    return i.map(x => x + addition);
}

export function multiply(multiplication: number, i: number[]): number[] {
    return i.map(x => x * multiplication);
}
