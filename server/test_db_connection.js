const sql = require('mssql');

const dbConfig = {
    user: 'sa',
    password: 'euchp1',
    server: 'localhost',
    database: 'POSDPS',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function testConnection() {
    try {
        console.log('Attempting to connect to SQL Server...');
        const pool = await sql.connect(dbConfig);
        console.log('✅ Connection Successful!');

        // Try a simple query
        const result = await pool.request().query('SELECT @@VERSION as version');
        console.log('SQL Server Version:', result.recordset[0].version);

        await pool.close();
    } catch (err) {
        console.error('❌ Connection Failed:', err);
    }
}

testConnection();
