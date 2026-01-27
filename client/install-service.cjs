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

// Evento: Cuando se completa la instalación
svc.on('install', () => {
  console.log('✅ TimeClockClient instalado correctamente.');
  svc.start();
});

// Evento: Cuando se completa la desinstalación (importante para reinstalar)
svc.on('uninstall', () => {
  console.log('🗑️ Desinstalación completa. Procediendo a reinstalar...');
  svc.install();
});

// Evento: Si ya existe, primero desinstalamos
svc.on('alreadyinstalled', () => {
  console.log('ℹ️ El servicio ya existe. Limpiando versión anterior...');
  svc.uninstall(); // Esto disparará el evento 'uninstall' arriba cuando termine
});

svc.on('start', () => {
  console.log('🚀 TimeClockClient iniciado en el puerto 444');
});

svc.on('error', (err) => {
  console.error('❌ Error en el servicio:', err);
});

console.log('Iniciando proceso de instalación de TimeClockClient...');
svc.install();