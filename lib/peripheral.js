import noble from 'noble';
import debug from 'debug';
import Q from 'q';

const log = debug('Peripheral');
const TIMEOUT = 10000;
const BLUETOOTH_ON = 'poweredOn';

export default class Peripheral {
  constructor(name) {
    log('Creating class Peripheral', name);
    this.name = name;
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

  _reset() {
    this.device = null;
    this.services = null;
  }

  async connect() {
    const deferred = Q.defer();
    const timeout = setTimeout(() => {
      noble.stopScanning();
      deferred.reject(`No peripheral found with name "${this.name}"`);
    }, TIMEOUT);
    
    log('Trying to connect bluetooth...');
    
    noble.on('stateChange', async (state) => {
      log('State changed:', state);
      if (state === BLUETOOTH_ON) {
        const peripheral = await this._scan();

        noble.stopScanning();
        if (peripheral) {
          log('The peripheral is ready to connect');
          this._handleDisconnection(peripheral);
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
    let error;

    if (this.isConnected) {
      const disconnect = Q.denodeify(this.peripheral.disconnect.bind(this.peripheral));
      
      error = await disconnect();
    }
    
    if (!error) {
      log(`Successfully disconnected to the peripheral with name "${this.name}"`);
      this._reset();
    }

    return !error;
  }

  async discover() {
    if (!this.isConnected) {
      throw new Error(`The peripheral "${this.name}" is not connected`);
    }
    log('Scanning services...');
    
    const discover = Q.denodeify(this.peripheral.discoverAllServicesAndCharacteristics.bind(this.peripheral));
    const [error, services] = await discover();
    
    if (!error) {
      log(`Discovered ${services.length} services`);
    }

    services.forEach((service) => log(`Service discovered "${service.uuid}"`));
    this.services = services

    return error ? [] : services;
  }

  _scan() {
    const deferred = Q.defer();
    const timeout = setTimeout(() => deferred.resolve(), TIMEOUT);

    log('Start scanning...');
    noble.startScanning()
    noble.on('discover', (peripheral) => {
      log('Discovered peripheral:', peripheral.advertisement.localName);
      if (peripheral.advertisement.localName === this.name) {
          deferred.resolve(peripheral);
      }
    });

    return deferred.promise;
  }

  async _handleDisconnection(peripheral) {
    peripheral.once('disconnect', () => {
      this.disconnect();
    });
  } 

  async _connectToDevice(peripheral) {
    log('Trying to connect...');

    const connect = Q.denodeify(peripheral.connect.bind(peripheral));
    const error = await connect();

    if (!error) {
      log(`Successfully connected to the peripheral with name "${this.name}"`);
    }

    return !error;
  } 
}
