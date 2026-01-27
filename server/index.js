const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const os = require("os");

const https = require('https');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increase limit for base64 images

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} from ${req.ip}`);
    next();
});

// Ensure captures directory exists
const capturesDir = path.join(__dirname, 'captures');
console.log('Captures Directory:', capturesDir);
if (!fs.existsSync(capturesDir)) {
    fs.mkdirSync(capturesDir);
    console.log('Created captures directory');
}
const keyFile = path.join(__dirname, 'certs', 'key.pem');
const certFile = path.join(__dirname, 'certs', 'cert.pem');
// Load Certificates
const certDir = path.join(__dirname, "certs")

const privateKey = fs.readFileSync(path.join(__dirname, 'certs', 'key.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem'), 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Database Config
const dbConfig = {
    user: 'sa',
    password: 'euchp1',
    server: 'localhost\\CSE', // Assuming SQL Server is on the same machine
    database: 'POSDPS',
    options: {
        encrypt: false, // Disable encryption for local dev if needed, or set to true for Azure
        trustServerCertificate: true // Trust self-signed certs
    }
};

// Connect to Database
let dbConnected = false;
sql.connect(dbConfig).then(pool => {
    if (pool.connected) {
        dbConnected = true;
        console.log('✓ Connected to SQL Server');
    }
}).catch(err => {
    console.error('✗ Database connection failed:', err);
    console.error('  Server will start but database operations will fail.');
});


// Health Check Endpoint
app.get('/api/health', async (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: dbConnected ? 'connected' : 'disconnected',
        uptime: process.uptime()
    };

    // Test database connection
    try {
        await sql.query('SELECT 1');
        health.database = 'connected';
    } catch (err) {
        health.database = 'error';
        health.databaseError = err.message;
    }

    res.json(health);
});

// Retail Manager API - Validate User
app.get('/cse.api.v1/ValidateUser', async (req, res) => {
    const { UserID, UserPass } = req.query;
    console.log(`Validating user: ${UserID}`);

    if (!UserID || !UserPass) {
        return res.json({ success: false, message: 'UserID and UserPass are required' });
    }

    try {
        const pool = await sql.connect(dbConfig);

        // Query to validate user credentials
        // Using correct column names: IdNumero and Password
        console.log('Executing user validation query...');
        console.log(`UserID: ${UserID}, UserPass: ${UserPass}`);

        const result = await pool.request()
            .input('UserID', sql.Int, UserID)
            .input('UserPass', sql.VarChar, UserPass)
            .query(`
                SELECT IdNumero, Nombre, Activo, Identificador AS Acces,
                (SELECT COUNT(*) FROM [dbo].[Ponchador] WHERE UsuarioId = @UserID) as numPonches
                FROM [dbo].[Usuarios] 
                WHERE IdNumero = @UserID 
                AND Password = @UserPass 
                AND Activo = 'S'
            `);
        if (result.recordset.length > 0) {
            console.log('User validated successfully');
            res.json({
                success: true,
                message: 'User validated successfully',
                user: {
                    ID: result.recordset[0].IdNumero,
                    Name: result.recordset[0].Nombre,
                    Active: result.recordset[0].Activo,
                    numPonches: result.recordset[0].numPonches,
                    Acces: result.recordset[0].Acces
                }
            });
        } else {
            res.json({ success: false, message: 'Invalid credentials or inactive user' });
        }

    } catch (err) {
        console.error('Validation error:', err);
        res.status(500).json({ success: false, message: 'Database error during validation' });
    }
});

// Retail Manager API - Get Employees
app.get('/cse.api.v1/GetEmployees', async (req, res) => {
    const { ID } = req.query;
    console.log(`Getting employee details for ID: ${ID}`);

    try {
        const pool = await sql.connect(dbConfig);

        let query = `
            SELECT 
                u.IdNumero AS ID,
                u.Nombre AS Name,
                u.Activo AS Active,
                u.Identificador AS Acces,
                COUNT(p.UsuarioId) AS numPonches
            FROM [dbo].[Usuarios] u
            LEFT JOIN [dbo].[Ponchador] p 
                ON p.UsuarioId = u.IdNumero
        `;

        let request = pool.request();

        if (ID) {
            query += ' WHERE u.IdNumero = @ID';
            request.input('ID', sql.Int, ID);
        }

        query += `
            GROUP BY 
                u.IdNumero,
                u.Nombre,
                u.Activo,
                u.Identificador
        `;

        const result = await request.query(query);
        if (ID && result.recordset.length > 0) {
            res.json(result.recordset[0]);
        }
        res.json(result.recordset);

    } catch (err) {
        console.error('Get employees error:', err);
        res.status(500).json({ success: false, message: 'Database error fetching employees' });
    }
});


// Clock Endpoint
app.post('/cse.api.v1/clock', async (req, res) => {
    const { UserID, image } = req.body;
    console.log(`Received clock request for UserID: ${UserID}`);

    if (!UserID) {
        return res.status(400).json({ success: false, message: 'UserID is required' });
    }

    // Debug logging
    const imgLen = image ? image.length : 0;
    const { debugInfo } = req.body;
    let logMsg = `[${new Date().toISOString()}] Received clock request for UserID: ${UserID}. Image length: ${imgLen}\n`;

    if (debugInfo) {
        logMsg += `Debug Info: ${JSON.stringify(debugInfo)}\n`;
    }

    try {
        fs.appendFileSync(path.join(capturesDir, 'debug.txt'), logMsg);
    } catch (e) { console.error('Log error', e); }

   

    try {
        const pool = await sql.connect(dbConfig);

        // Check total records to determine state (In vs Out)
        // Even records = Currently Out -> Clock In
        // Odd records = Currently In -> Clock Out
        const countResult = await pool.request()
            .input('UserID', sql.Int, UserID)
            .query('SELECT COUNT(*) as count FROM [dbo].[Ponchador] WHERE UsuarioId = @UserID');

        const count = countResult.recordset[0].count;
        const isClockIn = count % 2 === 0;
        const action = isClockIn ? 'Clock In' : 'Clock Out';

        // Insert new record
        const result=await pool.request()
            .input('UserID', sql.Int, UserID)
            .query('INSERT INTO [dbo].[Ponchador] (UsuarioId, FechaTiempo) OUTPUT INSERTED.ID, INSERTED.FechaTiempo VALUES (@UserID, GETDATE())');
        let timestamp = result.recordset[0].FechaTiempo;
        console.log("Tiempo de punch desde SQL:", timestamp);
        console.log("Tipo de timestamp:",timestamp.getUTCHours());
         // Save Photo if provided .
        if (image) {
            console.log('Image data received. Attempting to save...');
            try {
                const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");

                // Format timestamp for filename: YYYYMMDD_HHMMSS
                const yyyy = timestamp.getUTCFullYear();
                const mm = String(timestamp.getUTCMonth() + 1).padStart(2, '0');
                const dd = String(timestamp.getUTCDate()).padStart(2, '0');
                const hh = String(timestamp.getUTCHours()).padStart(2, '0');
                const min = String(timestamp.getUTCMinutes()).padStart(2, '0');
                const ss = String(timestamp.getUTCSeconds()).padStart(2, '0');
                const timeStr = `${yyyy}${mm}${dd}_${hh}${min}${ss}`;

                const filename = `${UserID}_${timeStr}.jpg`;
                const filePath = path.join(capturesDir, filename);

                try {
                    fs.writeFileSync(filePath, base64Data, 'base64');
                    console.log('Photo saved successfully:', filePath);
                    // Debug file
                    fs.appendFileSync(path.join(capturesDir, 'debug.txt'), 'Write successful at ' + new Date() + '\n');
                } catch (writeErr) {
                    console.error('Error saving photo:', writeErr);
                }
            } catch (imgErr) {
                console.error('Error processing image:', imgErr);
            }
        } else {
            console.log('No image data received in request.');
        }

        res.json({
            success: true,
            ID: result.recordset[0].ID,
            action,
            timestamp,
            message: `Employee ${UserID} ${action.toLowerCase()}ed at ${timestamp.toLocaleTimeString()}`
        });

    } catch (err) {
        console.error('SQL Error:', err);
        // Even if SQL fails, we return 500, but the photo should have been saved above.
        res.status(500).json({ success: false, message: 'Internal Server Error (Database)' });
    }
});
// Retail Manager API - Get Punches
app.get('/cse.api.v1/GetWorkHours', async (req, res) => {
    const { UserID, StartDate, EndDate } = req.query;

    try {
        const pool = await sql.connect(dbConfig);
        const request = pool.request();

        // Parámetros opcionales
        request.input('UserID', sql.Int, UserID || null);
        request.input('StartDate', sql.DateTime, StartDate || null);
        request.input('EndDate', sql.DateTime, EndDate || null);

        const query = `
            WITH PunchesCTE AS (
                SELECT
                    p.ID AS punchId,
                    p.UsuarioId AS userId,
                    u.Nombre AS userName,
                    p.FechaTiempo,
                    ROW_NUMBER() OVER (
                        PARTITION BY p.UsuarioId
                        ORDER BY p.FechaTiempo
                    ) AS rn
                FROM [dbo].[Ponchador] p
                INNER JOIN [dbo].[Usuarios] u
                    ON u.IdNumero = p.UsuarioId
                WHERE
                    (@UserID IS NULL OR p.UsuarioId = @UserID)
                    AND (@StartDate IS NULL OR p.FechaTiempo >= @StartDate)
                    AND (@EndDate IS NULL OR p.FechaTiempo <= @EndDate)
            ),
            PunchPairs AS (
                SELECT
                    p1.punchId,
                    p1.userId,
                    p1.userName,
                    p1.FechaTiempo AS clockIn,
                    p2.FechaTiempo AS clockOut,
                    DATEDIFF(MINUTE, p1.FechaTiempo, p2.FechaTiempo) AS minutesWorked,
                    CASE 
                        WHEN p2.FechaTiempo IS NULL THEN 1
                        ELSE 0
                    END AS isOrphan
                FROM PunchesCTE p1
                LEFT JOIN PunchesCTE p2
                    ON p1.UserId = p2.UserId
                    AND p1.rn + 1 = p2.rn
                WHERE p1.rn % 2 = 1
            )
            SELECT
                punchId,
                userId,
                userName,
                clockIn,
                clockOut,
                minutesWorked,
                isOrphan
            FROM PunchPairs
            ORDER BY clockIn DESC;
        `;

        const result = await request.query(query);
        res.json(result.recordset);

    } catch (error) {
        console.error('Error calculating work hours:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating work hours'
        });
    }
});
app.post('/cse.api.v1/CreatePTO', async (req, res) => {
    const { userId, userName, startDate, endDate } = req.body;

    // 🔹 Normalizamos fechas
    const start = new Date(startDate);
    const end = new Date(endDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1️⃣ Fechas >= hoy
    if (start < today || end < today) {
        return res.status(400).json({
            success: false,
            message: 'Las fechas deben ser mayores o iguales a hoy'
        });
    }

    // 2️⃣ Start <= End
    if (start > end) {
        return res.status(400).json({
            success: false,
            message: 'La fecha inicial no puede ser mayor a la fecha final'
        });
    }

    try {
        const pool = await sql.connect(dbConfig);

        // 3️⃣ Validar solapamiento
        const overlapQuery = `
            SELECT 1
            FROM dbo.PTORequests
            WHERE UserId = @UserId
              AND Status <> 'denied'
              AND StartDate <= @EndDate
              AND EndDate   >= @StartDate
        `;

        const overlapResult = await pool.request()
            .input('UserId', sql.Int, userId)
            .input('StartDate', sql.DateTime2, start)
            .input('EndDate', sql.DateTime2, end)
            .query(overlapQuery);

        if (overlapResult.recordset.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Ya tienes un PTO que se cruza con las fechas seleccionadas'
            });
        }

        // 4️⃣ Insertar PTO
        const insertQuery = `
            INSERT INTO dbo.PTORequests (
                UserId,
                UserName,
                StartDate,
                EndDate,
                Status,
                StatusChanged
            )
            OUTPUT INSERTED.Id
            VALUES (
                @UserId,
                @UserName,
                @StartDate,
                @EndDate,
                'requested',
                0
            )
        `;

        const insertResult = await pool.request()
            .input('UserId', sql.Int, userId)
            .input('UserName', sql.NVarChar(150), userName)
            .input('StartDate', sql.DateTime2, start)
            .input('EndDate', sql.DateTime2, end)
            .query(insertQuery);

        res.json({
            success: true,
            message: 'PTO creado correctamente',
            id: insertResult.recordset[0].Id
        });

    } catch (err) {
        console.error('Create PTO error:', err);
        res.status(500).json({
            success: false,
            message: 'Error interno al crear PTO'
        });
    }
});

app.put('/cse.api.v1/UpdatePTOStatus', async (req, res) => {
    const { id, status } = req.body;

    if (!['requested', 'approved', 'denied'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Estado inválido' });
    }

    try {
        const pool = await sql.connect(dbConfig);

        const query = `
            UPDATE dbo.PTORequests
            SET 
                Status = @Status,
                StatusChanged = 1
            WHERE Id = @Id
        `;

        const result = await pool.request()
            .input('Id', sql.Int, id)
            .input('Status', sql.NVarChar(20), status)
            .query(query);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ success: false, message: 'PTO no encontrado' });
        }

        res.json({ success: true, message: 'Estado del PTO actualizado' });

    } catch (err) {
        console.error('Update PTO Status error:', err);
        res.status(500).json({ success: false, message: 'Error actualizando PTO' });
    }
});
app.get('/cse.api.v1/GetAllPTO', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);

        const query = `
            SELECT
                id,
                userId,
                userName,
                startDate,
                endDate,
                status,
                statusChanged,
                createdAt
            FROM dbo.PTORequests
            ORDER BY
                CASE WHEN Status = 'requested' THEN 0 ELSE 1 END,
                CreatedAt DESC
        `;

        const result = await pool.request().query(query);

        res.json(result.recordset);

    } catch (err) {
        console.error('Get all PTO error:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching PTO requests'
        });
    }
});
// En tu archivo principal (app.js o server.js)
app.use('/cse.api.v1/files', express.static(path.join(__dirname, 'captures')));
async function ensurePTORequestsTable() {
    try {
        const pool = await sql.connect(dbConfig);

        const query = `
            IF NOT EXISTS (
                SELECT 1
                FROM sys.tables t
                JOIN sys.schemas s ON t.schema_id = s.schema_id
                WHERE t.name = 'PTORequests'
                  AND s.name = 'dbo'
            )
            BEGIN
                CREATE TABLE dbo.PTORequests (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    UserId INT NOT NULL,
                    UserName NVARCHAR(150),
                    StartDate DATETIME2 NOT NULL,
                    EndDate DATETIME2 NOT NULL,
                    Status NVARCHAR(20) NOT NULL,
                    StatusChanged BIT NOT NULL DEFAULT 0,
                    CreatedAt DATETIME2 DEFAULT SYSDATETIME()
                );
            END
        `;

        await pool.request().query(query);
        console.log('✅ PTORequests table verified');

    } catch (err) {
        console.error('❌ Error ensuring PTORequests table:', err);
        throw err;
    }
}
// --- DETECCIÓN DE IP (Lógica mejorada de tu script) ---
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    const validInterfaces = ['Wi-Fi', 'Ethernet', 'Adaptador de Ethernet', 'Conexión de red inalámbrica'];
    
    for (let iface in interfaces) {
        if (validInterfaces.some(name => iface.includes(name))) {
            for (let alias of interfaces[iface]) {
                if (alias.family === 'IPv4' && !alias.internal) {
                    return alias.address;
                }
            }
        }
    }
    // Fallback por si no detecta nombres estándar
    for (let iface in interfaces) {
        for (let alias of interfaces[iface]) {
            if (alias.family === 'IPv4' && !alias.internal) return alias.address;
        }
    }
    return "127.0.0.1";
}

// --- AUTOMATIZACIÓN DE MKCERT ---
function setupCertificates() {
    if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir);
    }

    const localIP = getLocalIP();

    try {
        console.log("🛠️ -- Configurando certificados SSL locales...");
        //  execSync("choco install mkcert");
        //  console.log("✅ mkcert instalado correctamente.");

        // // Instala la CA en el sistema (requiere privilegios de admin la primera vez)
        // execSync("mkcert -install");
        
        // Generamos para localhost, 127.0.0.1 y la IP dinámica detectada
        console.log(`🛠️ -- Generando certificados:mkcert -key-file "${keyFile}" -cert-file "${certFile}" localhost 127.0.0.1 ${localIP}`);
        execSync(
            `mkcert -key-file "${keyFile}" -cert-file "${certFile}" localhost 127.0.0.1 ${localIP}`,
            { stdio: 'inherit' } 
        );
        console.log("✅ Certificados generados/actualizados correctamente.");
    } catch (error) {
        console.error("❌ Error con mkcert: Asegúrate de tenerlo instalado (brew install mkcert / choco install mkcert)");
        process.exit(1);
    }
}

// --- INICIALIZACIÓN ---
// Si no existen los certificados, los creamos





const httpsServer = https.createServer(credentials, app);
const localIP = getLocalIP();
// ... dentro de tu función donde ya tienes la variable localIP
const frontendEnvPath = path.join(__dirname, '../client/.env.local'); // Ajusta la ruta a tu carpeta front
const envContent = `NEXT_PUBLIC_BACKEND_IP=${localIP}`;  

fs.writeFileSync(frontendEnvPath, envContent);
console.log("✅ Archivo .env.local del client actualizado automáticamente.");
httpsServer.listen(PORT, localIP, async () => {
    
    console.log('\n========================================');
    console.log('✓ HTTPS Server Started Successfully');
    console.log('========================================');
    console.log(`Port: ${PORT}`);
    console.log(`Time: ${new Date().toLocaleString()}`);
    console.log('\nAccess URLs:');
    console.log(`  Local:    https://localhost:${PORT}`);
    await ensurePTORequestsTable();

    // Get network interfaces
    const os = require('os');
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                console.log(`  Network:  https://${iface.address}:${PORT}`);
            }
        }
    }

    console.log('\nEndpoints:');
    console.log('  POST /api/clock  - Clock in/out');
    console.log('  GET  /api/health - Health check');
    console.log('========================================\n');
});
