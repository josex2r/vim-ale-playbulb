const noble = require('noble');
const debug = require('debug')('Candle');
const Q = require('q');

const TIMEOUT = 10000;
const BLUETOOTH_ON = 'poweredOn';
const EFFECTS_UUID = "fffb";
const NAME_UUID = "ffff";

module.exports = class Playbulb {
  constructor(name = 'PLAYBULB') {
    debug('Creating class Candle', name);
    this.name = name;
    this.connected = false;
  }

  get isConnected () {
    return !!this.peripheral;
  }

  get services () {
    return this._services || [];
  }

  set services(services) {
    this._services = services;
  }

  async connect() {
    const deferred = Q.defer();
    const timeout = setTimeout(() => {
      noble.stopScanning();
      deferred.reject(`No peripheral found with name "${this.name}"`);
    }, TIMEOUT);
    
    debug('Trying to connecti bluetooth...');
    
    noble.on('stateChange', async (state) => {
      debug('State changed:', state);
      if (state === BLUETOOTH_ON) {
        const peripheral = await this._scan();

        noble.stopScanning();
        if (peripheral) {
          debug('The peripheral is ready to connect');
          const isConnected = await this._connectToDevice(peripheral);
          
          if (isConnected) {
            this.peripheral = peripheral;
            deferred.resolve(peripheral);
          } else {
            deferred.reject('Unable to connect :(');
          }
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
      throw new Error(`The peripheral "${this.name}" is not connected`);
    }
    
    const disconnect = Q.denodeify(this.peripheral.disconnect.bind(this.peripheral));
    const error = await disconnect();

    if (!error) {
      debug(`Successfully disconnected to the peripheral with name "${this.name}"`);
    }

    return !error;
  }

  async discover() {
    if (!this.isConnected) {
      throw new Error(`The peripheral "${this.name}" is not connected`);
    }
    debug('Scanning services...');
    
    const discover = Q.denodeify(this.peripheral.discoverAllServicesAndCharacteristics.bind(this.peripheral));
    const [error, services] = await discover();
    
    if (!error) {
      debug(`Discovered ${services.length} services`);
    }

    services.forEach((service) => debug(`Service discovered "${service.uuid}"`));
    this.services = services

    return error ? [] : services;
  }

  _scan() {
    const deferred = Q.defer();
    const timeout = setTimeout(() => deferred.resolve(), TIMEOUT);

    debug('Start scanning...');
    noble.startScanning()
    noble.on('discover', (peripheral) => {
      debug('Discovered peripheral:', peripheral.advertisement.localName);
      if (peripheral.advertisement.localName === this.name) {
          deferred.resolve(peripheral);
      }
    });

    return deferred.promise;
  }

  async _connectToDevice(peripheral) {
    debug('Trying to connect...');

    const connect = Q.denodeify(peripheral.connect.bind(peripheral));
    const error = await connect();

    if (!error) {
      debug(`Successfully connected to the peripheral with name "${this.name}"`);
    }

    return !error;
  } 
}
