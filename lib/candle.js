const noble = require('noble');
const debug = require('debug')('Candle');
const Q = require('q');

const TIMEOUT = 10000;
const BLUETOOTH_ON = 'poweredOn';

module.exports = class Playbulb {
  constructor(name = 'PLAYBULB') {
    debug('Creating class Candle', name);
    this.name = name;
    this.connected = false;
  }

  get isConnected () {
    return !!this.device;
  }

  async connect() {
    const deferred = Q.defer();
    const timeout = setTimeout(() => {
      noble.stopScanning();
      deferred.reject(`No device found with name "${this.name}"`);
    }, TIMEOUT);
    
    debug('Trying to connect');
    
    noble.on('stateChange', async (state) => {
      debug('State changed:', state);
      if (state === BLUETOOTH_ON) {
        const device = await this._scan();

        noble.stopScanning();
        if (device) {
          debug('Device ready to connect');
          const isConnected = await this._connectToDevice(device);
          this.device = device;
          deferred.resolve(device);
        }
      } else {
        noble.stopScanning();
        deferred.reject('Bluetooth powered off');
      }
    });

    return deferred.promise;
  }

  async disconnect() {
    if (!this.isConnected) {
      throw new Error(`The device "${this.name}" is not connected`);
    }
    
    const disconnect = Q.denodeify(this.device.disconnect.bind(this.device));
    const error = await disconnect();

    if (error) {
      debug(`There was an error: ${error}`);
    } else {
      debug(`Successfully disconnected to the device with name "${this.name}"`);
    }

    return !!error;
  }

  async findServices() {
    if (!this.isConnected) {
      throw new Error(`The device "${this.name}" is not connected`);
    }
    
  }

  _scan() {
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

  async _connectToDevice(device) {
    debug('Trying to connect...');

    const connect = Q.denodeify(device.connect.bind(device));
    const error = await connect();

    if (error) {
      debug(`There was an error: ${error}`);
    } else {
      debug(`Successfully connected to the device with name "${this.name}"`);
    }

    return !!error;
  } 
}
