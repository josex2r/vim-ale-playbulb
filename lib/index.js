const debug = require('debug')('Playbulb');
const noble = require('noble');
const Candle = require('./candle.js');

const candle = new Candle();

try {
  candle.connect();
} catch(e) {
  debug(e); 
}
