export interface IDataSource {

    getBTCBalance(): Promise<number>;
    getCurrentBTCPrice(): Promise<number>;
    getZARBalance(): Promise<number>;
}
