import * as BitX from 'bitx';

import { IDataSource } from '../interfaces/data-source';

export class LunoDataSource implements IDataSource {

    private client: BitX = null;

    constructor(
        private keyId: string,
        private keySecret: string,
    ) {
        this.client = new BitX(keyId, keySecret);
    }

    public async getBTCBalance(): Promise<number> {
        const balances: any = await this.getBalance(['XBT', 'ZAR']);

        return parseFloat(balances.balance.find((x) => x.asset === 'XBT').balance) - parseFloat(balances.balance.find((x) => x.asset === 'XBT').reserved);
    }

    public async getCurrentBTCPrice(): Promise<number> {
        const ticker: any = await this.getTicker();

        return parseFloat(ticker.last_trade);
    }

    public async getZARBalance(): Promise<number> {
        const balances: any = await this.getBalance(['XBT', 'ZAR']);

        return parseFloat(balances.balance.find((x) => x.asset === 'ZAR').balance) - parseFloat(balances.balance.find((x) => x.asset === 'ZAR').reserved);
    }

    private getBalance(assets: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.getBalance(assets, (err, result) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }

                resolve(result);
            });
        });
    }

    private getTicker(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.getTicker((err, result) => {
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
