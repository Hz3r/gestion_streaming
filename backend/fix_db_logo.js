const mysql = require('mysql2/promise');

async function fixDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || process.env.MYSQLHOST,
    user: process.env.DB_USER || process.env.MYSQLUSER,
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE,
    port: Number(process.env.DB_PORT) || Number(process.env.MYSQL_PORT),
        });

        console.log('Conectado a la base de datos...');
        
        await connection.execute('ALTER TABLE configuracion MODIFY COLUMN logo_url LONGTEXT');
        console.log('✅ Columna logo_url actualizada a LONGTEXT correctamente.');
        
        await connection.end();
    } catch (error) {
        console.error('❌ Error al actualizar la base de datos:', error.message);
    }
}

fixDatabase();
