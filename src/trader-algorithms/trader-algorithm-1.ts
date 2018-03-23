import * as fs from 'fs';
import * as moment from 'moment';
import * as path from 'path';
import * as statsLite from 'stats-lite';

import { State } from '../enums/state';
import { ITraderAlgorithm } from '../interfaces/trader-algorithm';
import { DataPoint } from '../models/data-point';
import { Queue } from '../models/queue';

export class TraderAlgorithm1 implements ITraderAlgorithm {

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
        console.log(`Bought for ${this.numberToString(price)}`);

        this.previousBuyPrice = price;
    }

    public onChange(price: number): void {
        this.dataPointQueue.enqueue(new DataPoint(price, new Date()));
        console.log(`Price updated ${this.numberToString(price)}`);

        this.setGrowths();

        this.checkEmergencySellRules(price);

        if (this.dataPointQueue.isFull()) {
            console.log(`Average Growth: ${this.numberToString(this.currentAverageGrowth)}`);
            console.log(`Delta Average Growth: ${this.numberToString(this.deltaAverageGrowth)}`);

            fs.appendFileSync(path.join(__dirname, `log-${moment().format('YYYY-MM-DD')}.csv`), `${moment().format('YYYY-MM-DD HH:mm:ss')};${this.numberToString(this.dataPointQueue.getLast().price)};${this.numberToString(this.currentAverageGrowth)};${this.numberToString(this.deltaAverageGrowth)}\r\n`);
        }
    }

    public onSell(price: number): void {
        console.log(`Sold for ${this.numberToString(price)}`);

        console.log(`Profit: ${this.numberToString(price - this.previousBuyPrice)}`);

        fs.appendFileSync(path.join(__dirname, `log-profit-${moment().format('YYYY-MM-DD')}.csv`), `${this.numberToString(price - this.previousBuyPrice)}`);
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

    private setGrowths(): void {
        if (this.dataPointQueue.isFull()) {
            this.currentAverageGrowth = this.calculateAverageGrowth();

            if (this.previousAverageGrowth) {
                this.deltaAverageGrowth = this.currentAverageGrowth - this.previousAverageGrowth;
            }

            this.previousAverageGrowth = this.currentAverageGrowth;
        }
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

    private checkEmergencySellRules(price: number): void {
        if (this.currentAverageGrowth < -0.3) {
            this.emergencySell = true;
        } else if (this.previousBuyPrice && (price / this.previousBuyPrice * 100) - 100 < this.emergencySellThreshold) {
            // this.emergencySell = true;
        }
    }

    private numberToString(value: number): string {
        return value ? value.toString().replace('.', ',') : null;
    }
}
