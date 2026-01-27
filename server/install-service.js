const Service = require('node-windows').Service;
const path = require('path');

// Configuración del servicio
const svc = new Service({
    name: 'TimeClockServer',
    description: 'Time Clock System - Backend API Server',
    script: path.join(__dirname, 'index.js'),
    nodeOptions: [
        '--harmony',
        '--max_old_space_size=4096'
    ],
    env: [
        {
            name: "NODE_ENV",
            value: "production"
        }
    ]
});

// --- Manejo de Eventos ---

// 1. Éxito en la instalación
svc.on('install', function () {
    console.log('TimeClockServer service installed successfully.');
    svc.start();
});

// 2. El servicio ya existe: Gatillamos la desinstalación
svc.on('alreadyinstalled', function () {
    console.log('Service already exists. Uninstalling first to perform a clean install...');
    svc.uninstall();
});

// 3. Una vez desinstalado: Intentamos instalar de nuevo
svc.on('uninstall', function () {
    console.log('Old service uninstalled. Proceeding with new installation...');
    svc.install();
});

// 4. Inicio del servicio
svc.on('start', function () {
    console.log('TimeClockServer service started.');
    console.log('Server is running on port 3000');
});

// 5. Manejo de errores
svc.on('error', function (err) {
    console.error('Error in TimeClockServer service operation:', err);
});

// --- Acción Inicial ---
console.log('Starting installation process...');
svc.install();