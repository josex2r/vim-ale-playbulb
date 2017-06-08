const debug = require('debug')('Playbulb');
const noble = require('noble');
const Candle = require('./candle.js');

const candle = new Candle();

(async function run() {
  try {
    const device = await candle.connect();
    candle.disconnect();
  } catch(e) {
    debug(e); 
  }
})();
