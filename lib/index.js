import debug from 'debug';
import noble from 'noble';
import Candle from './candle';

const log = debug('Playbulb');
const candle = new Candle();

(async function run() {
  try {
    const peripheral = await candle.connect();
    const services = await candle.discover();
    candle.off();
    setTimeout(() => candle.candleEffect(), 3000);
    setTimeout(() => candle.changeColor(1, 123, 234, 65), 6000);
    // candle.disconnect();
  } catch(e) {
    debug(e); 
  }
})();
