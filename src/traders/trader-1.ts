import * as BitX from 'bitx';

import { State } from '../enums/state';
import { IDataSource } from '../interfaces/data-source';
import { IOrderCreator } from '../interfaces/order-creator';
import { ITrader } from '../interfaces/trader';
import { ITraderAlgorithm } from '../interfaces/trader-algorithm';

export class Trader1 implements ITrader {

    private client: BitX = null;

    private currentBTCBalance: number = null;

    private currentBTCPrice: number = null;

    private currentZARBalance: number = null;

    private state: State = State.WaitingToBuy;

    private maxZARBuyLimit: number = 150;

    constructor(
        private dataSource: IDataSource,
        private orderCreator: IOrderCreator,
        private traderAlgorithm: ITraderAlgorithm,
    ) {

    }

    public async tick(): Promise<void> {
        this.currentBTCBalance = await this.dataSource.getBTCBalance();
        this.currentBTCPrice = await this.dataSource.getCurrentBTCPrice();
        this.currentZARBalance = await this.dataSource.getZARBalance();

        this.traderAlgorithm.onChange(this.currentBTCPrice);

        const shouldBuy: boolean = this.traderAlgorithm.shouldBuy(this.state);

        if (shouldBuy) {
            const result: any = await this.orderCreator.placeBuyOrder(Math.floor(this.maxZARBuyLimit / this.currentBTCPrice * 1000000) / 1000000, this.currentBTCPrice);

            this.traderAlgorithm.onBuy(this.currentBTCPrice);

            this.state = State.WaitingToSell;

            return;
        }

        const shouldSell: boolean = this.traderAlgorithm.shouldSell(this.state);

        if (shouldSell) {
            const result: any = await this.orderCreator.placeSellOrder(Math.floor(this.currentBTCBalance * 1000000) / 1000000, this.currentBTCPrice);

            this.traderAlgorithm.onSell(this.currentBTCPrice);

            this.state = State.WaitingToBuy;

            return;
        }
    }

}
