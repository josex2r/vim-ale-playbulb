const noble = require('noble');
const debug = require('debug')('Candle');
const Q = require('q');

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
      } else {
        noble.stopScanning();
      }
    });

    return deferred.promise;
  }

  async scan() {
    const deferred = Q.defer();

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
