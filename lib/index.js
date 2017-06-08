const debug = require('debug')('Playbulb');
const noble = require('noble');
const Candle = require('./candle.js');

const candle = new Candle();

(async function run() {
  try {
    const peripheral = await candle.connect();
    const services = await candle.discover();
    candle.disconnect();
  } catch(e) {
    debug(e); 
  }
})();
