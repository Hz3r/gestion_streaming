import mysql from 'mysql2/promise';

async function test() {
    const pool = mysql.createPool({
       host: process.env.DB_HOST || process.env.MYSQLHOST,
    user: process.env.DB_USER || process.env.MYSQLUSER,
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE,
    port: Number(process.env.DB_PORT) || Number(process.env.MYSQL_PORT),
    });

    try {
        const [rows] = await pool.execute('SELECT id_contrato, id_cliente, id_cuenta, id_metodo FROM contratos ORDER BY id_contrato DESC LIMIT 5');
        console.log("Contratos en BD:", rows);

        const [rows2] = await pool.execute(`SELECT 
            c.id_contrato,
            u.nombre AS cliente,
            cu.email AS cuenta,
            p.nombre AS plataforma,
            mp.nombre AS metodo_pago
        FROM contratos c
        INNER JOIN usuarios u ON c.id_cliente = u.id_usuario
        INNER JOIN cuentas cu ON c.id_cuenta = cu.id_cuenta
        INNER JOIN plataformas p ON cu.id_plataforma = p.id_plataforma
        INNER JOIN metodo_pago mp ON c.id_metodo = mp.id_metodo
        ORDER BY c.id_contrato DESC LIMIT 5`);
        console.log("Contratos con JOIN:", rows2);

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

test();
