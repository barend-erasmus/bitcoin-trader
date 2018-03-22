import { AES128CTRCryptographyAlgorithm } from './cryptography-algorithms/aes-256-ctr';
import { ICryptographyAlgorithm } from './interfaces/cryptography-algorithm';
import { ITraderAlgorithm } from './interfaces/trader-algorithm';
import { TraderAlgorithm1 } from './trader-algorithms/trader-algorithm-1';
import { LunoTrader } from './traders/luno';

(async () => {
    const cryptographyAlgoritm: ICryptographyAlgorithm = new AES128CTRCryptographyAlgorithm('');

    const keyId: string = 'e2ffd53e85c0075ea3b8d6a98d';
    const keySecret: string = 'dfa5cf66b7d13c548a99b9f9a045d3f9ed9a099b7dd8901305a150a104adf0a206fec78be29ef957a3652c';

    const traderAlgorithm: ITraderAlgorithm = new TraderAlgorithm1(null);
    const trader = new LunoTrader(cryptographyAlgoritm.decrypt(keyId), cryptographyAlgoritm.decrypt(keySecret), traderAlgorithm);

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
