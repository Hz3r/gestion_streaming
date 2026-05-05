const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

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
        
        // Verificar si la columna ya existe
        const [rows] = await connection.execute('SHOW COLUMNS FROM configuracion LIKE "subtitulo_sitio"');
        
        if (rows.length === 0) {
            await connection.execute('ALTER TABLE configuracion ADD COLUMN subtitulo_sitio VARCHAR(255) DEFAULT "Management System" AFTER titulo_sitio');
            console.log('✅ Columna subtitulo_sitio añadida correctamente.');
        } else {
            console.log('ℹ️ La columna subtitulo_sitio ya existe.');
        }
        
        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

fixDatabase();
