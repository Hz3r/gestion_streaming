const mysql = require('mysql2/promise');

async function fixDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '123',
            database: 'gestion_streaming'
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
