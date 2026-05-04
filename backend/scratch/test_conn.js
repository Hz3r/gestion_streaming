import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function testConnection() {
    console.log('Probando conexión con:', {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: Number(process.env.DB_PORT)
        });
        console.log('✅ Conexión exitosa');
        await connection.end();
    } catch (err) {
        console.error('❌ Error de conexión:', err);
    }
}

testConnection();
