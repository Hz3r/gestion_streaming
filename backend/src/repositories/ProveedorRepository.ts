import Proveedor from "../models/Proveedor";
import pool from "../config/db";

class ProveedorRepository {

    async crearProveedor(proveedor: Proveedor): Promise<number> {
        const sql = `INSERT INTO proveedores (nombre, url_contacto, reputacion) VALUES (?, ?, ?)`;
        const [result]: any = await pool.execute(sql, [proveedor.nombre, proveedor.url_contacto, proveedor.reputacion]);
        return result.insertId;
    }

    async obtenerTodos(): Promise<Proveedor[]> {
        const sql = 'SELECT id_proveedor, nombre, url_contacto, reputacion FROM proveedores';
        const [rows]: any = await pool.execute(sql);
        return rows;
    }

    async obtenerPorId(id: number): Promise<Proveedor | null> {
        const sql = 'SELECT id_proveedor, nombre, url_contacto, reputacion FROM proveedores WHERE id_proveedor = ?';
        const [rows]: any = await pool.execute(sql, [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    async actualizar(id: number, proveedor: Proveedor): Promise<number> {
        const sql = 'UPDATE proveedores SET nombre = ?, url_contacto = ?, reputacion = ? WHERE id_proveedor = ?';
        const [result]: any = await pool.execute(sql, [proveedor.nombre, proveedor.url_contacto, proveedor.reputacion, id]);
        return result.affectedRows;
    }

    async eliminar(id: number): Promise<number> {
        const sql = 'DELETE FROM proveedores WHERE id_proveedor = ?';
        const [result]: any = await pool.execute(sql, [id]);
        return result.affectedRows;
    }
}

export default new ProveedorRepository();