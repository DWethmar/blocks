export interface Component<T> {
    id: string;
    type: string;
    gameObjectId: string;
    dirty: boolean;
    state: T;
}
