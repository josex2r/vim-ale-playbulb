const noble = require('noble');
const Q = require('q');

const BLUETOOTH_ON = 'poweredOn';

module.exports = class Playbulb {
  constructor(name, uuid = 'xxxx') {
    this.name = name;
    this.uuid = uuid;
  }

  connect(cb) {
    const deferred = Q.defer();
    
    noble.on('stateChange', function(state) {
      if (state === BLUETOOTH_ON) {
        noble.startScanning()

        noble.on('device', console.log)

      } else {
        noble.stopScanning();
      }
    });

    return deferred.promise;
  }
}
