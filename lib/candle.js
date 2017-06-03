const noble = require('noble');
const debug = require('debug')('Candle');
const Q = require('q');

const TIMEOUT = 10000;
const BLUETOOTH_ON = 'poweredOn';

module.exports = class Playbulb {
  constructor(name = 'PLAYBULB') {
    console.log('Creating class Candle', name);
    this.name = name;
    this.connected = false;
  }

  async connect() {
    const deferred = Q.defer();
    
    debug('Trying to connect');
    
    noble.on('stateChange', async (state) => {
      debug('State changed:', state);
      if (state === BLUETOOTH_ON) {
        const device = await this.scan();

        noble.stopScanning();
        if (device) {
          debug('Device ready to connect');
        } else {
          throw new Error(`No device found with name "${this.name}"`);
        }
      } else {
        noble.stopScanning();
        throw new Error('Bluetooth powered off');
      }
    });

    return deferred.promise;
  }

  async scan() {
    const deferred = Q.defer();
    const timeout = setTimeout(() => deferred.resolve(), TIMEOUT);

    debug('Start scanning');
    noble.startScanning()
    noble.on('discover', (device) => {
      debug('Discovered device:', device.advertisement.localName);
      if (device.advertisement.localName === this.name) {
          deferred.resolve(device);
      }
    });

    return deferred.promise;
  }
}
