import debug from 'debug';
import noble from 'noble';
import express from 'express';
import bodyParser from 'body-parser';
import Candle from './candle';
import Routes from './routes';

const log = debug('Playbulb');
const candle = new Candle();
const app = express();
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

(async function run() {
  try {
    const peripheral = await candle.connect();
    const services = await candle.discover();
    // Turn off playbulb
    candle.off();
    // Set white candle effect
    // setTimeout(() => candle.candleEffect(), 2000);
    // Set color grren (keeping precious effect)
    // setTimeout(() => candle.setColor(1, 0, 255, 0), 4000);
    // Set red color without efect
    // setTimeout(() => candle.setEffect(1, 255, 0, 0, candle.FX.COLOR, candle.SPEED.SLOW), 8000);
    // candle.disconnect();
    
    // Init server
    const routes = Routes(app, candle);
    const server = app.listen(8723, function () {
      log(`Playbulb server listening on port ${server.address().port}`);
    });
  } catch(e) {
    debug(e); 
  }
})();
