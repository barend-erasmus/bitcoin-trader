import * as fs from 'fs';
import * as moment from 'moment';
import * as statsLite from 'stats-lite';

import { State } from '../enums/state';
import { IAlgorithm } from '../interfaces/algorithm';
import { DataPoint } from '../models/data-point';
import { Queue } from '../models/queue';

export class Algorithm1 implements IAlgorithm {

    private dataPointQueue: Queue<DataPoint> = new Queue<DataPoint>(10);

    private previousAverageGrowth: number = null;

    constructor() {

    }

    public onBuy(price: number): void {
        console.log(`Bought for ${price}`);
    }

    public onChange(price: number): void {
        this.dataPointQueue.enqueue(new DataPoint(price, new Date()));
        console.log(`Price updated ${price}`);
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

        const currentAverageGrowth: number = this.calculateAverageGrowth();

        if (this.previousAverageGrowth) {
            const deltaAverageGrowth: number = currentAverageGrowth - this.previousAverageGrowth;
            console.log(`Delta Average Growth: ${deltaAverageGrowth}`);

            fs.appendFileSync('delta-average-growth.txt', `${deltaAverageGrowth},`);
        }

        this.previousAverageGrowth = currentAverageGrowth;

        return false;
    }

    public shouldSell(state: State): boolean {
        if (state !== State.WaitingToSell) {
            return false;
        }

        return false;
    }

    private calculateAverageGrowth(): number {
        const growth: number[] = [];

        const dataPoints: DataPoint[] = this.dataPointQueue.toArray();

        const previousPrice: number = dataPoints[0].price;

        for (let index: number = 1; index < dataPoints.length; index ++) {
            growth.push((dataPoints[index].price / previousPrice * 100) - 100);
        }

        return statsLite.mean(growth);
    }
}
