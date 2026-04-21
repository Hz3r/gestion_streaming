import pool from "../config/db";
import Contratos from "../models/Contratos";
import ContratosDetalleDTO from "../dtos/ContratosDetalleDTO";

class ContratoRepository{
    //crear contrato
    async crearContrato(contrato:Contratos):Promise<number> {
        const sql = `INSERT INTO contratos(
        id_cliente,
        id_cuenta,
        id_metodo,
        perfiles_alquilados,
        fecha_inicio,
        fecha_vencimiento,
        precio_unitario,
        precio_total,
        estado_pagado
        ) 
        VALUES (?,?,?,?,?,?,?,?,?)`;
        const [result]:any = await pool.execute(sql,[
            contrato.id_cliente,
            contrato.id_cuenta,
            contrato.id_metodo,
            contrato.perfiles_alquilados,
            contrato.fecha_inicio,
            contrato.fecha_vencimiento,
            contrato.precio_unitario,
            contrato.precio_total,
            contrato.estado_pagado
        ]);
        return result.insertId;
    }

    //obtener todos los contratos
    async obtenerTodos():Promise<Contratos[]> {
        const sql = 'SELECT * FROM contratos';
        const [rows]:any = await pool.execute(sql);
        return rows;
    }

    //obtener contrato por id
    async obtenerPorId(id:number):Promise<Contratos | null> {
        const sql = 'SELECT * FROM contratos WHERE id_contrato = ?';
        const [rows]:any = await pool.execute(sql,[id]);
        return rows.length > 0 ? rows[0] : null;
    }

    //obtener contratos por cliente
    async obtenerPorCliente(id_cliente:number):Promise<Contratos[]> {
        const sql = 'SELECT * FROM contratos WHERE id_cliente = ?';
        const [rows]:any = await pool.execute(sql,[id_cliente]);
        return rows;
    }

    //obtener contratos por cuenta
    async obtenerPorCuenta(id_cuenta:number):Promise<Contratos[]> {
        const sql = 'SELECT * FROM contratos WHERE id_cuenta = ?';
        const [rows]:any = await pool.execute(sql,[id_cuenta]);
        return rows;
    }

    //contar perfiles ocupados en una cuenta (solo contratos activos/no vencidos)
    async contarPerfilesOcupados(id_cuenta:number):Promise<number> {
        const sql = `SELECT COALESCE(SUM(perfiles_alquilados), 0) as total_perfiles 
                     FROM contratos 
                     WHERE id_cuenta = ? AND fecha_vencimiento >= CURDATE()`;
        const [rows]:any = await pool.execute(sql,[id_cuenta]);
        return rows[0].total_perfiles;
    }

    //obtener detalle del contrato con JOINs
    async obtenerDetalleTodos():Promise<ContratosDetalleDTO[]> {
        const sql = `SELECT 
            c.id_contrato,
            u.nombre AS nombre_cliente,
            cu.email AS email_cuenta,
            p.nombre AS nombre_plataforma,
            mp.nombre AS nombre_metodo_pago,
            c.perfiles_alquilados,
            c.fecha_inicio,
            c.fecha_vencimiento,
            c.precio_unitario,
            c.precio_total,
            c.estado_pagado
        FROM contratos c
        INNER JOIN usuarios u ON c.id_cliente = u.id_usuario
        INNER JOIN cuentas cu ON c.id_cuenta = cu.id_cuenta
        INNER JOIN plataformas p ON cu.id_plataforma = p.id_plataforma
        INNER JOIN metodos_pago mp ON c.id_metodo = mp.id_metodo_pago`;
        const [rows]:any = await pool.execute(sql);
        return rows;
    }

    //obtener detalle de un contrato por id con JOINs
    async obtenerDetallePorId(id:number):Promise<ContratosDetalleDTO | null> {
        const sql = `SELECT 
            c.id_contrato,
            u.nombre AS nombre_cliente,
            cu.email AS email_cuenta,
            p.nombre AS nombre_plataforma,
            mp.nombre AS nombre_metodo_pago,
            c.perfiles_alquilados,
            c.fecha_inicio,
            c.fecha_vencimiento,
            c.precio_unitario,
            c.precio_total,
            c.estado_pagado
        FROM contratos c
        INNER JOIN usuarios u ON c.id_cliente = u.id_usuario
        INNER JOIN cuentas cu ON c.id_cuenta = cu.id_cuenta
        INNER JOIN plataformas p ON cu.id_plataforma = p.id_plataforma
        INNER JOIN metodos_pago mp ON c.id_metodo = mp.id_metodo_pago
        WHERE c.id_contrato = ?`;
        const [rows]:any = await pool.execute(sql,[id]);
        return rows.length > 0 ? rows[0] : null;
    }

    //actualizar contrato
    async actualizar(id:number,contrato:Contratos):Promise<number> {
        const sql = `UPDATE contratos SET 
            id_cliente = ?, 
            id_cuenta = ?, 
            id_metodo = ?, 
            perfiles_alquilados = ?, 
            fecha_inicio = ?, 
            fecha_vencimiento = ?, 
            precio_unitario = ?, 
            precio_total = ?,
            estado_pagado = ? 
            WHERE id_contrato = ?`;
        const [result]:any = await pool.execute(sql,[
            contrato.id_cliente,
            contrato.id_cuenta,
            contrato.id_metodo,
            contrato.perfiles_alquilados,
            contrato.fecha_inicio,
            contrato.fecha_vencimiento,
            contrato.precio_unitario,
            contrato.precio_total,
            contrato.estado_pagado,
            id
        ]);
        return result.affectedRows;
    }

    //eliminar contrato
    async eliminar(id:number):Promise<number> {
        const sql = 'DELETE FROM contratos WHERE id_contrato = ?';
        const [result]:any = await pool.execute(sql,[id]);
        return result.affectedRows;
    }

}

export default new ContratoRepository();