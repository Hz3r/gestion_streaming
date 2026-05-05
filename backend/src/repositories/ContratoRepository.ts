import pool from "../config/db.js";
import Contratos from "../models/Contratos.js";

class ContratoRepository{
    
    // Crear contrato (Maestro-Detalle con Transacción)
    async crearContrato(contrato:Contratos):Promise<number> {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            // Insertar Maestro
            const sql = `INSERT INTO contratos(
                id_cliente, id_metodo, fecha_inicio, fecha_vencimiento, 
                precio_unitario, precio_total, estado_pagado, tipo_contrato, id_usuario
            ) VALUES (?,?,?,?,?,?,?,?,?)`;
            
            const [result]:any = await connection.execute(sql,[
                contrato.id_cliente ?? null, 
                contrato.id_metodo ?? null, 
                contrato.fecha_inicio ?? null, 
                contrato.fecha_vencimiento ?? null, 
                contrato.precio_unitario ?? 0, 
                contrato.precio_total ?? 0, 
                contrato.estado_pagado ?? 0,
                contrato.tipo_contrato || 'Directo',
                contrato.id_usuario ?? null
            ]);
            
            const id_contrato = result.insertId;

            // Insertar Detalles (Cuentas)
            if (contrato.detalles && contrato.detalles.length > 0) {
                const sqlDetalle = `INSERT INTO contratos_detalles (id_contrato, id_cuenta, perfiles_alquilados) VALUES (?,?,?)`;
                for (const det of contrato.detalles) {
                    await connection.execute(sqlDetalle, [id_contrato, det.id_cuenta ?? null, det.perfiles_alquilados ?? null]);
                }
            }

            await connection.commit();
            return id_contrato;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async obtenerTodos():Promise<Contratos[]> {
        const sql = 'SELECT * FROM contratos';
        const [rows]:any = await pool.execute(sql);
        return rows;
    }

    async obtenerPorId(id:number):Promise<Contratos | null> {
        const sql = 'SELECT * FROM contratos WHERE id_contrato = ?';
        const [rows]:any = await pool.execute(sql,[id ?? null]);
        return rows.length > 0 ? rows[0] : null;
    }

    async obtenerPorCliente(id_cliente:number):Promise<Contratos[]> {
        const sql = 'SELECT * FROM contratos WHERE id_cliente = ?';
        const [rows]:any = await pool.execute(sql,[id_cliente ?? null]);
        return rows;
    }

    async obtenerPorCuenta(id_cuenta:number):Promise<Contratos[]> {
        const sql = `SELECT c.* FROM contratos c 
                     INNER JOIN contratos_detalles cd ON c.id_contrato = cd.id_contrato 
                     WHERE cd.id_cuenta = ?`;
        const [rows]:any = await pool.execute(sql,[id_cuenta ?? null]);
        return rows;
    }

    async contarPerfilesOcupados(id_cuenta:number):Promise<number> {
        const sql = `SELECT COALESCE(SUM(cd.perfiles_alquilados), 0) as total_perfiles 
                     FROM contratos c 
                     INNER JOIN contratos_detalles cd ON c.id_contrato = cd.id_contrato
                     WHERE cd.id_cuenta = ? AND c.fecha_vencimiento >= CURDATE()`;
        const [rows]:any = await pool.execute(sql,[id_cuenta ?? null]);
        return rows[0].total_perfiles;
    }

    // Obtener contratos agrupando sus cuentas en un JSON Array
    async obtenerDetalleTodos(): Promise<any[]> {
        const sql = `SELECT 
            c.id_contrato,
            cl.nombre AS cliente,
            mp.nombre AS metodo_pago,
            c.fecha_inicio,
            c.fecha_vencimiento,
            c.precio_unitario,
            c.precio_total,
            c.estado_pagado,
            c.tipo_contrato,
            c.id_cliente,
            c.id_metodo,
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
        INNER JOIN metodo_pago mp ON c.id_metodo = mp.id_metodo
        LEFT JOIN contratos_detalles cd ON c.id_contrato = cd.id_contrato
        LEFT JOIN cuentas cu ON cd.id_cuenta = cu.id_cuenta
        LEFT JOIN plataformas p ON cu.id_plataforma = p.id_plataforma
        GROUP BY c.id_contrato
        ORDER BY c.id_contrato DESC`;
        const [rows]:any = await pool.execute(sql);
        return rows;
    }

    async obtenerDetallePorId(id: number): Promise<any | null> {
        const sql = `SELECT 
            c.id_contrato,
            cl.nombre AS cliente,
            mp.nombre AS metodo_pago,
            c.fecha_inicio,
            c.fecha_vencimiento,
            c.precio_unitario,
            c.precio_total,
            c.estado_pagado,
            c.tipo_contrato,
            c.id_cliente,
            c.id_metodo,
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
        INNER JOIN metodo_pago mp ON c.id_metodo = mp.id_metodo
        LEFT JOIN contratos_detalles cd ON c.id_contrato = cd.id_contrato
        LEFT JOIN cuentas cu ON cd.id_cuenta = cu.id_cuenta
        LEFT JOIN plataformas p ON cu.id_plataforma = p.id_plataforma
        WHERE c.id_contrato = ?
        GROUP BY c.id_contrato`;
        const [rows]:any = await pool.execute(sql,[id ?? null]);
        return rows.length > 0 ? rows[0] : null;
    }

    // Actualizar (Maestro-Detalle)
    async actualizar(id:number,contrato:Contratos):Promise<number> {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            const sql = `UPDATE contratos SET 
                id_cliente = ?, id_metodo = ?, fecha_inicio = ?, 
                fecha_vencimiento = ?, precio_unitario = ?, 
                precio_total = ?, estado_pagado = ?, tipo_contrato = ? 
                WHERE id_contrato = ?`;
                
            await connection.execute(sql,[
                contrato.id_cliente ?? null, 
                contrato.id_metodo ?? null, 
                contrato.fecha_inicio ?? null, 
                contrato.fecha_vencimiento ?? null, 
                contrato.precio_unitario ?? 0, 
                contrato.precio_total ?? 0, 
                contrato.estado_pagado ?? 0, 
                contrato.tipo_contrato || 'Directo',
                id ?? null
            ]);

            // Recrear detalles si vienen en el objeto
            if (contrato.detalles) {
                await connection.execute(`DELETE FROM contratos_detalles WHERE id_contrato = ?`, [id ?? null]);
                if (contrato.detalles.length > 0) {
                    const sqlDetalle = `INSERT INTO contratos_detalles (id_contrato, id_cuenta, perfiles_alquilados) VALUES (?,?,?)`;
                    for (const det of contrato.detalles) {
                        await connection.execute(sqlDetalle, [id ?? null, det.id_cuenta ?? null, det.perfiles_alquilados ?? null]);
                    }
                }
            }

            await connection.commit();
            return 1;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async eliminar(id:number):Promise<number> {
        const sql = 'DELETE FROM contratos WHERE id_contrato = ?';
        const [result]:any = await pool.execute(sql,[id ?? null]);
        return result.affectedRows;
    }

    async obtenerProximosAVencer(dias: number): Promise<any[]> {
        const sql = `
            SELECT c.*, cl.nombre as nombre_cliente 
            FROM contratos c
            INNER JOIN clientes cl ON c.id_cliente = cl.id_cliente
            WHERE c.fecha_vencimiento BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? DAY)
        `;
        const [rows]: any = await pool.execute(sql, [dias]);
        return rows;
    }
}

export default new ContratoRepository();