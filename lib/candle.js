import noble from 'noble';
import debug from 'debug';
import Q from 'q';
import Peripheral from './peripheral';
import decimalToHexBytes from './decimal-to-hex-bytes';

const log = debug('Candle');
const UUID = {
  EFFECTS: 'fffb',
  NAME: 'ffff'
};
const FX = {
  FADE: 1,
  JUMPRGB: 2,
  FADERGB: 3,
  CANDLE: 4
};
const SPEED = {
  SLOW: 0,
  FAST: 1
};


export default class Candle extends Peripheral {
  constructor(name = 'PLAYBULB') {
    log('Creating class Candle', name);
    super(name);
    this.FX = FX;
    this.UUID = UUID;
    this.SPEED = SPEED;
  }

  setEffect(saturation = 255, r = 0, g = 0, b = 0, effect = FX.CANDLE, speed = 0.2) {
    if (!this.isConnected || !this.hasServices) {
      return 'Candle is not ready :(';
    }

    const values = [saturation, r, g, b];
    const inRange = values.some((value) => (value >= 0 && value <= 255));

    if (!inRange) {
      log('Error setting effect: saturation, red, green and blue must be between 0 and 255');
      return 'Saturation, red, green and blue must be between 0 and 255';
    }

    if (speed < 0 && speed > 1) {
      log('Error setting effect: Speed must be between 0 and 1');
      return 'Speed must be between 0 and 1';
    }

    if (!Object.keys(FX).some((key) => FX[key] === effect)) {
      log('Error setting effect: Efect type not valid');
      return 'Efect type not valid';
    }

    if (speed !== SPEED.SLOW || speed !== SPEED.FAST) {
      speed = decimalToHexBytes(speed, 255);
      speed = speed < 3 ? 3 : speed;
    }
    
    const bytes = new Buffer([saturation, r, g, b, effect, 0, 0, 0]);
    const effectsCharacteristic = this.services.find((service) => service.uuid === UUID.EFFECTS);

    log('Setting effect', bytes, bytes.toString('hex'));

    // return effectsService.write(new Buffer(bytes.toString('')));
    return effectsCharacteristic.write(bytes, true);
  }

  changeColor(saturation, r, g, b) {
    return this.setEffect(saturation, r, g, b, FX.FADERGB);
  }

  candleEffect() {
    return this.setEffect(255, 255, 255, 255, FX.CANDLE, SPEED.SLOW);
  }

  off() {
    return this.setEffect(0);
  }
}
