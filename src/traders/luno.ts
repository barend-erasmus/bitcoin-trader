import * as BitX from 'bitx';

import { State } from '../enums/state';
import { ITraderAlgorithm } from '../interfaces/trader-algorithm';

export class LunoTrader {

    private client: BitX = null;

    private currentBTCBalance: number = null;

    private currentBTCPrice: number = null;

    private currentZARBalance: number = null;

    private state: State = State.WaitingToBuy;

    private maxZARBuyLimit: number = 200;

    constructor(
        private keyId: string,
        private keySecret: string,
        private traderAlgorithm: ITraderAlgorithm,
    ) {
        this.client = new BitX(keyId, keySecret);
    }

    public async tick(): Promise<void> {
        await this.getBalances();

        this.currentBTCPrice = await this.getCurrentBTCPrice();

        this.traderAlgorithm.onChange(this.currentBTCPrice);

        const shouldBuy: boolean = this.traderAlgorithm.shouldBuy(this.state);

        if (shouldBuy) {
            // const result: any = await this.postBuyOrder(Math.floor(this.maxZARBuyLimit / this.currentBTCPrice * 1000000) / 1000000, this.currentBTCPrice);

            this.traderAlgorithm.onBuy(this.currentBTCPrice);

            this.state = State.WaitingToSell;

            return;
        }

        const shouldSell: boolean = this.traderAlgorithm.shouldSell(this.state);

        if (shouldSell) {
            // const result: any = await this.postSellOrder(Math.floor(this.currentBTCBalance * 1000000) / 1000000, this.currentBTCPrice);

            this.traderAlgorithm.onSell(this.currentBTCPrice);

            this.state = State.WaitingToBuy;

            return;
        }
    }

    private async getBalances(): Promise<void> {
        const balances: any = await this.getBalance(['XBT', 'ZAR']);

        this.currentBTCBalance = parseFloat(balances.balance.find((x) => x.asset === 'XBT').balance) - parseFloat(balances.balance.find((x) => x.asset === 'XBT').reserved);
        this.currentZARBalance = parseFloat(balances.balance.find((x) => x.asset === 'ZAR').balance) - parseFloat(balances.balance.find((x) => x.asset === 'ZAR').reserved);
    }

    private getBalance(assets: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.getBalance(assets, (err, result) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }

                // console.log(result);
                resolve(result);
            });
        });
    }

    public async getCurrentBTCPrice(): Promise<number> {
        const ticker: any = await this.getTicker();

        return ticker.last_trade;
    }

    private getTicker(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.getTicker((err, result) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }

                // console.log(result);
                resolve(result);
            });
        });
    }

    private postBuyOrder(volume: number, price: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.postBuyOrder(volume, price, (err, result) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }

                // console.log(result);
                resolve(result);
            });
        });
    }

    private postSellOrder(volume: number, price: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.postSellOrder(volume, price, (err, result) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }

                // console.log(result);
                resolve(result);
            });
        });
    }
}
