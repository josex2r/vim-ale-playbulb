import noble from 'noble';
import debug from 'debug';
import Q from 'q';
import Peripheral from './peripheral';
import decimalToHexBytes from './decimal-to-hex-bytes';

const log = debug('Candle');
const UUID = {
  EFFECTS: 'fffb',
  COLOR: 'fffc',
  NAME: 'ffff'
};
const FX = {
  FADE: 1,
  JUMPRGB: 2,
  FADERGB: 3,
  CANDLE: 4,
  COLOR: 5
};
const SPEED = {
  SLOW: 0,
  FAST: 1
};

function validateRGBStauration(saturation, r, g, b) {
  const values = [saturation, r, g, b];
  const inrange = values.some((value) => (value >= 0 && value <= 255));

  return inrange;
}

function validateSpeed(speed) {
  return speed >= 0 && speed <= 1;
}

function validateEffect(effect) {
  return Object.keys(FX).some((key) => FX[key] === effect);
}

export default class Candle extends Peripheral {
  constructor(name = 'PLAYBULB') {
    log('Creating class Candle', name);
    super(name);
    this.FX = FX;
    this.UUID = UUID;
    this.SPEED = SPEED;
  }

  _validateValues(saturation, r, g, b, speed, effect) {
    if (!validateRGBStauration(saturation, r, g, b)) {
      log('Error setting effect: saturation, red, green and blue must be between 0 and 255, values:', saturation, r, g, b);
      return 'Saturation, red, green and blue must be between 0 and 255';
    }

    if (speed !== undefined && !validateSpeed(speed)) {
      log('Error setting effect: Speed must be between 0 and 1, value:', speed);
      return 'Speed must be between 0 and 1';
    }

    if (effect !== undefined && !validateEffect(effect)) {
      log('Error setting effect: Efect type not valid, value', effect);
      return 'Efect type not valid';
    }
  }

  _getCharacterictic(uuid) {
    return this.services.find((service) => service.uuid === uuid);
  }

  setEffect(saturation = 255, r = 0, g = 0, b = 0, effect = FX.CANDLE, speed = 0.2) {
    if (!this.isConnected || !this.hasServices) {
      return 'Candle is not ready :(';
    }

    const error = this._validateValues(saturation, r, g, b, speed, effect);

    if (error) {
      throw new Error(error);
    }

    if (speed !== SPEED.SLOW || speed !== SPEED.FAST) {
      speed = decimalToHexBytes(speed, 255);
      speed = speed < 3 ? 3 : speed;
    }
    
    const bytes = new Buffer([saturation, r, g, b, effect, 0, 0, 0]);
    const effectsCharacteristic = this._getCharacterictic(UUID.EFFECTS);

    log('Setting effect', bytes, bytes.toString('hex'));

    return effectsCharacteristic.write(bytes, true);
  }

  setColor(saturation, r, g, b) {
    if (!this.isConnected || !this.hasServices) {
      return 'Candle is not ready :(';
    }

    const error = this._validateValues(saturation, r, g, b);
    
    const bytes = new Buffer([saturation, r, g, b]);
    const colorCharacteristic = this._getCharacterictic(UUID.COLOR);

    log('Setting color', bytes, bytes.toString('hex'));

    return colorCharacteristic.write(bytes, true);
  }

  candleEffect() {
    return this.setEffect(255, 255, 255, 255, FX.CANDLE, SPEED.SLOW);
  }

  off() {
    return this.setEffect(0);
  }
}
