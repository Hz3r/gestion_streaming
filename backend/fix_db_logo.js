const mysql = require('mysql2/promise');

async function fixDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '123', // Ajusta si tienes contraseña
            database: 'gestion_streaming'
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
