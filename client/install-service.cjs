const Service = require('node-windows').Service;
const path = require('path');

const svc = new Service({
  name: 'TimeClockClient',
  description: 'Time Clock System - Next.js Frontend',
  script: path.join(__dirname, 'server.cjs'),
  nodeOptions: [
    '--max_old_space_size=4096'
  ],
  env: [
    {
      name: "NODE_ENV",
      value: "production"
    }
  ]
});

svc.on('install', () => {
  console.log('✅ TimeClockClient installed');
  svc.start();
});

svc.on('alreadyinstalled', () => {
  console.log('ℹ️ Service already installed');
});

svc.on('start', () => {
  console.log('🚀 TimeClockClient started on port 444');
});

svc.on('error', (err) => {
  console.error('❌ Service error:', err);
});

console.log('Installing TimeClockClient service...');
svc.install();
