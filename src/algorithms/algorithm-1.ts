import * as fs from 'fs';
import * as moment from 'moment';
import * as statsLite from 'stats-lite';

import { State } from '../enums/state';
import { IAlgorithm } from '../interfaces/algorithm';
import { DataPoint } from '../models/data-point';
import { Queue } from '../models/queue';

export class Algorithm1 implements IAlgorithm {

    private currentAverageGrowth: number = null;

    private dataPointQueue: Queue<DataPoint> = new Queue<DataPoint>(10);

    private deltaAverageGrowth: number = null;

    private emergencySell: boolean = false;

    private emergencySellThreshold: number = 20;

    private previousAverageGrowth: number = null;

    constructor(
        private previousBuyPrice: number,
    ) {

    }

    public onBuy(price: number): void {
        console.log(`Bought for ${price}`);

        this.previousBuyPrice = price;
    }

    public onChange(price: number): void {
        this.dataPointQueue.enqueue(new DataPoint(price, new Date()));
        console.log(`Price updated ${price}`);

        if (this.dataPointQueue.isFull()) {
            this.currentAverageGrowth = this.calculateAverageGrowth();
            // console.log(`Average Growth: ${this.currentAverageGrowth}`);

            if (this.previousAverageGrowth) {
                this.deltaAverageGrowth = this.currentAverageGrowth - this.previousAverageGrowth;
                // console.log(`Delta Average Growth: ${this.deltaAverageGrowth}`);

                fs.appendFileSync('log.txt', `${moment().format('YYYY-MM-DD HH:mm:ss')};${this.dataPointQueue.getLast().price.toString().replace('.', ',')};${this.currentAverageGrowth.toString().replace('.', ',')};${this.deltaAverageGrowth.toString().replace('.', ',')}\r\n`);
            }

            this.previousAverageGrowth = this.currentAverageGrowth;
        }

        if (this.previousBuyPrice && (price / this.previousBuyPrice * 100) - 100 < this.emergencySellThreshold) {
            this.emergencySell = true;
        }
    }

    public onSell(price: number): void {
        console.log(`Sold for ${price}`);
    }

    public shouldBuy(state: State): boolean {
        if (state !== State.WaitingToBuy) {
            return false;
        }

        if (!this.dataPointQueue.isFull()) {
            return false;
        }

        if (this.currentAverageGrowth > 0.8) {
            return true;
        }

        return false;
    }

    public shouldSell(state: State): boolean {
        if (state !== State.WaitingToSell) {
            return false;
        }

        if (this.emergencySell) {
            this.emergencySell = false;
            return true;
        }

        if (this.currentAverageGrowth < -0.8) {
            return true;
        }

        return false;
    }

    private calculateAverageGrowth(): number {
        const growth: number[] = [];

        const dataPoints: DataPoint[] = this.dataPointQueue.toArray();

        const previousPrice: number = dataPoints[0].price;

        for (let index: number = 1; index < dataPoints.length; index++) {
            growth.push((dataPoints[index].price / previousPrice * 100) - 100);
        }

        return statsLite.mean(growth);
    }
}
