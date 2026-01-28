const os = require('os'); // Importante: sin esto la función fallará

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    
    // Definimos el orden de prioridad
    const priority = ['Ethernet', 'Adaptador de Ethernet', 'Wi-Fi', 'Conexión de red inalámbrica'];

    // 1. Intentar por orden de prioridad
    for (const type of priority) {
        for (let iface in interfaces) {
            if (iface.toLowerCase().includes(type.toLowerCase())) {
                for (let alias of interfaces[iface]) {
                    if (alias.family === 'IPv4' && !alias.internal) {
                        return alias.address;
                    }
                }
            }
        }
    }

    // 2. Si no encontró ninguna de las anteriores, buscar CUALQUIER IPv4 externa
    for (let iface in interfaces) {
        for (let alias of interfaces[iface]) {
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }

    return "127.0.0.1";
}

// Llamada a la función para ver el resultado en consola
console.log("========================================");
console.log("IP Detectada:", getLocalIP());
console.log("========================================");
console.log("Interfaces disponibles en este equipo:");
console.log(Object.keys(os.networkInterfaces()));