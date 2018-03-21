import { Algorithm1 } from './algorithms/algorithm-1';
import { IAlgorithm } from './interfaces/algorithm';
import { LunoTrader } from './traders/luno';

(async () => {
    const algorithm: IAlgorithm = new Algorithm1();
    const trader = new LunoTrader(algorithm);

    while (true) {
        try {

            await trader.tick();

        } catch (err) {
            console.error(err);
        }

        await delay(14000);
    }
})();

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
