import pool from './src/config/db.js'; // Might not work because TS

import mysql from 'mysql2/promise';

async function test() {
    const p = mysql.createPool({host:'localhost',user:'root',password:'123',database:'gestion_streaming'});
    const [rows] = await p.execute(`SELECT 
            c.id_contrato,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id_cuenta', cu.id_cuenta,
                    'email', cu.email,
                    'plataforma', p.nombre,
                    'perfiles_alquilados', cd.perfiles_alquilados
                )
            ) AS cuentas
        FROM contratos c
        INNER JOIN clientes cl ON c.id_cliente = cl.id_cliente
        LEFT JOIN contratos_detalles cd ON c.id_contrato = cd.id_contrato
        LEFT JOIN cuentas cu ON cd.id_cuenta = cu.id_cuenta
        LEFT JOIN plataformas p ON cu.id_plataforma = p.id_plataforma
        WHERE c.id_contrato = 8
        GROUP BY c.id_contrato`);
    console.log(rows[0].cuentas);
    p.end();
}
test();
