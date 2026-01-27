/* const { spawn } = require("child_process");
const path = require("path");

const projectPath = __dirname;

const nextProcess = spawn(
  "npx",
  ["next", "start", "-p", "5173"],
  {
    cwd: projectPath,
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: "production"
    }
  }
);

nextProcess.on("close", (code) => {
  console.log(`Next.js exited with code ${code}`);
});
 */
// HTTPS server for Next.js

/* const https = require("https");
const fs = require("fs");
const path = require("path");
const next = require("next");

const hostname = "ponchador.local";
const port = 443;

const dev = false;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const certPath = path.join(__dirname, "certs");

const httpsOptions = {
  key: fs.readFileSync(path.join(certPath, "ponchador.local-key.pem")),
  cert: fs.readFileSync(path.join(certPath, "ponchador.local.pem")),
};

app.prepare().then(() => {
  https
    .createServer(httpsOptions, (req, res) => {
      handle(req, res);
    })
    .listen(port, hostname, () => {
      console.log(`🔐 Servidor HTTPS listo en https://${hostname}`);
    });
});
 */

const https = require("https");
const fs = require("fs");
const path = require("path");
const next = require("next");
const { execSync } = require("child_process");
const os = require("os");

// --- CONFIGURACIÓN ---
let hostname = "localhost";
const port = 444;
const certDir = path.join(__dirname, "certs");
const keyFile = path.join(certDir, "key.pem");
const certFile = path.join(certDir, "cert.pem");

// --- FUNCIÓN PARA DETECTAR TU IP LOCAL ---
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    // Lista de nombres comunes de adaptadores reales
    const validInterfaces = ['Wi-Fi', 'Ethernet', 'Adaptador de Ethernet', 'Conexión de red inalámbrica'];
    
    for (let iface in interfaces) {
        // Solo buscamos en interfaces que no parezcan virtuales
        if (validInterfaces.some(name => iface.includes(name))) {
            for (let alias of interfaces[iface]) {
                if (alias.family === 'IPv4' && !alias.internal) {
                    return alias.address;
                }
            }
        }
    }
    // Si no encuentra la "ideal", busca cualquiera que empiece por 192.168.101
    for (let iface in interfaces) {
        for (let alias of interfaces[iface]) {
            if (alias.family === 'IPv4' && !alias.internal && alias.address.startsWith('192.168.101')) {
                return alias.address;
            }
        }
    }
    return "127.0.0.1";
}

// --- FUNCIÓN PARA GENERAR CERTIFICADOS ---
function setupCertificates() {
    if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir);
    }

    const localIP = getLocalIP();
    console.log(`📡 IP detectada: ${localIP}`);

    try {
        console.log("🛠️ Configurando mkcert...");
        execSync("choco install mkcert");
        // Instala la CA en el sistema (requiere privilegios de admin la primera vez)
        execSync("mkcert -install");

        // Genera el certificado con nombres limpios usando los flags -key-file y -cert-file
        console.log("🎫 Generando certificados para ponchador.local, localhost e IP...");
        execSync(
            `mkcert -key-file "${keyFile}" -cert-file "${certFile}" ${hostname}  127.0.0.1 ${localIP}`
        );
        console.log("✅ Certificados generados correctamente.");
    } catch (error) {
        console.error("❌ Error ejecutando mkcert. Asegúrate de que mkcert esté instalado en el PATH.");
        process.exit(1);
    }
}

// --- ARRANQUE DEL SERVIDOR ---
//setupCertificates();

hostname = getLocalIP();
const dev = false;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const httpsOptions = {
    key: fs.readFileSync(keyFile),
    cert: fs.readFileSync(certFile),
};

app.prepare().then(() => {
    https.createServer(httpsOptions, (req, res) => {
        handle(req, res);
    }).listen(port, hostname, () => {
        console.log(`\n🚀 Servidor funcionando en:`);
        console.log(`   - https://${hostname}:${port}`);
        console.log(`   - https://localhost:${port}`);
        console.log(`   - https://${getLocalIP()}:${port}`);
    });
});