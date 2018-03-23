export interface IOrderCreator {

    placeBuyOrder(volume: number, price: number): Promise<void>;
    placeSellOrder(volume: number, price: number): Promise<void>;

}
