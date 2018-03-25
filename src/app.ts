import { AES256CTRCryptographyAlgorithm } from './cryptography-algorithms/aes-256-ctr';
import { CoindeskFileDataSource } from './data-sources/coindesk-file';
import { LunoDataSource } from './data-sources/luno';
import { ICryptographyAlgorithm } from './interfaces/cryptography-algorithm';
import { IDataSource } from './interfaces/data-source';
import { IOrderCreator } from './interfaces/order-creator';
import { ITrader } from './interfaces/trader';
import { ITraderAlgorithm } from './interfaces/trader-algorithm';
import { LunoOrderCreator } from './order-creators/luno';
import { TraderAlgorithm1 } from './trader-algorithms/trader-algorithm-1';
import { Trader1 } from './traders/trader-1';

(async () => {
    const cryptographyAlgoritm: ICryptographyAlgorithm = new AES256CTRCryptographyAlgorithm('');

    const keyId: string = 'e2ffd53e85c0075ea3b8d6a98d';
    const keySecret: string = 'dfa5cf66b7d13c548a99b9f9a045d3f9ed9a099b7dd8901305a150a104adf0a206fec78be29ef957a3652c';

    const dataSource: IDataSource = new LunoDataSource(cryptographyAlgoritm.decrypt(keyId), cryptographyAlgoritm.decrypt(keySecret));
    const orderCreator: IOrderCreator = new LunoOrderCreator(cryptographyAlgoritm.decrypt(keyId), cryptographyAlgoritm.decrypt(keySecret));
    // const dataSource: IDataSource = new CoindeskFileDataSource();
    const traderAlgorithm: ITraderAlgorithm = new TraderAlgorithm1(null);
    const trader: ITrader = new Trader1(dataSource, orderCreator, traderAlgorithm);

    while (true) {
        try {

            await trader.tick();

        } catch (err) {
            console.error(err);
        }

        await delay(60000);
    }
})();

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
