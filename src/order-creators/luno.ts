import * as BitX from 'bitx';

import { IOrderCreator } from '../interfaces/order-creator';

export class LunoOrderCreator implements IOrderCreator {

    private client: BitX = null;

    constructor(
        private keyId: string,
        private keySecret: string,
    ) {
        this.client = new BitX(keyId, keySecret);
    }

    public placeBuyOrder(volume: number, price: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.postBuyOrder(volume, price, (err, result) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }

                resolve(result);
            });
        });
    }

    public placeSellOrder(volume: number, price: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.postSellOrder(volume, price, (err, result) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }

                resolve(result);
            });
        });
    }

}
