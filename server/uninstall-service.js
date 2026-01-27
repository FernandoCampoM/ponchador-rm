const Service = require('node-windows').Service;
const path = require('path');

// Create a new service object
const svc = new Service({
    name: 'TimeClockServer',
    script: path.join(__dirname, 'index.js')
});

// Listen for the "uninstall" event
svc.on('uninstall', function () {
    console.log('TimeClockServer service uninstalled successfully.');
    console.log('The service has been removed.');
});

svc.on('alreadyuninstalled', function () {
    console.log('TimeClockServer service is not installed.');
});

svc.on('error', function (err) {
    console.error('Error uninstalling TimeClockServer service:', err);
});

// Uninstall the service
console.log('Uninstalling TimeClockServer service...');
svc.uninstall();
