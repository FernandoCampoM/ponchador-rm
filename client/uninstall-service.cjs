const Service = require('node-windows').Service;
const path = require('path');

const svc = new Service({
  name:'TimeClockClient',
  script: path.join(__dirname, 'server.cjs') // MISMA RUTA
});

svc.on('uninstall', function () {
  console.log('✓ TimeClockClient service uninstalled successfully');
});

svc.on('alreadyuninstalled', function () {
  console.log('⚠ Service is not installed');
});

svc.on('error', function (err) {
  console.error('✗ Uninstall error:', err);
});

console.log('Uninstalling TimeClockClient service...');
svc.uninstall();
