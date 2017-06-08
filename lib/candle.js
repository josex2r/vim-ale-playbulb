import noble from 'noble';
import debug from 'debug';
import Q from 'q';
import Peripheral from './peripheral';

const log = debug('Candle');
const EFFECTS_UUID = "fffb";
const NAME_UUID = "ffff";

export default class Candle extends Peripheral {
  constructor(name = 'PLAYBULB') {
    log('Creating class Candle', name);
    super(name);
  }
}
