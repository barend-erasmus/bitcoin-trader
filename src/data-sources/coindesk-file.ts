import * as fs from 'fs';
import * as path from 'path';

import { IDataSource } from '../interfaces/data-source';

export class CoindeskFileDataSource implements IDataSource {

    private currentIndex: number = 0;

    private data: number[] = [];

    constructor() {
        const contents = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'data.json'), 'utf8');

        const json = JSON.parse(contents);

        for (const key of Object.keys(json.bpi)) {
            this.data.push(json.bpi[key]);
        }
    }

    public async getBTCBalance(): Promise<number> {
        return 0;
    }

    public async getCurrentBTCPrice(): Promise<number> {
        const result: number = this.data[this.currentIndex];

        this.currentIndex ++;

        return result;
    }

    public async getZARBalance(): Promise<number> {
        return 0;
    }

}
