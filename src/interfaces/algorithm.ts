import { State } from '../enums/state';

export interface IAlgorithm {

    onBuy(price: number): void;

    onChange(price: number): void;

    onSell(price: number): void;

    shouldBuy(state: State): boolean;

    shouldSell(state: State): boolean;

}
