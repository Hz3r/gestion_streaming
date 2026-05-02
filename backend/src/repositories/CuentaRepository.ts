import Cuentas from "../models/Cuentas";
import pool from "../config/db";

class CuentaRepository {

    async crearCuenta(cuentas: Cuentas): Promise<number> {
        const sql = `INSERT INTO cuentas (email, contraseña, fecha_compra, fecha_expiracion, id_plataforma, id_proveedor, estado, capacidad_total) VALUES (?,?,?,?,?,?,?,?)`;
        const [result]: any = await pool.execute(sql, [cuentas.email, cuentas.contraseña, cuentas.fecha_compra, cuentas.fecha_expiracion, cuentas.id_plataforma, cuentas.id_proveedor, cuentas.estado, cuentas.capacidad_total]);
        return result.insertId;
    }

    async obtenerTodas(): Promise<Cuentas[]> {
        const sql = 'SELECT id_cuenta, email, contraseña, fecha_compra, fecha_expiracion, id_plataforma, id_proveedor, estado, capacidad_total, perfiles_en_uso FROM cuentas';
        const [rows]: any = await pool.execute(sql);
        return rows;
    }

    async obtenerPorId(id: number): Promise<Cuentas | null> {
        const sql = 'SELECT id_cuenta, email, contraseña, fecha_compra, fecha_expiracion, id_plataforma, id_proveedor, estado, capacidad_total, perfiles_en_uso FROM cuentas WHERE id_cuenta = ?';
        const [rows]: any = await pool.execute(sql, [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    async actualizar(id: number, cuentas: Cuentas): Promise<number> {
        const sql = 'UPDATE cuentas SET email = ?, contraseña = ?, fecha_compra = ?, fecha_expiracion = ?, id_plataforma = ?, id_proveedor = ?, estado = ?, capacidad_total = ? WHERE id_cuenta = ?';
        const [result]: any = await pool.execute(sql, [cuentas.email, cuentas.contraseña, cuentas.fecha_compra, cuentas.fecha_expiracion, cuentas.id_plataforma, cuentas.id_proveedor, cuentas.estado, cuentas.capacidad_total, id]);
        return result.affectedRows;
    }

    async eliminar(id: number): Promise<number> {
        const sql = 'DELETE FROM cuentas WHERE id_cuenta = ?';
        const [result]: any = await pool.execute(sql, [id]);
        return result.affectedRows;
    }

    // Actualizar el contador de perfiles en uso
    async actualizarPerfilesEnUso(id_cuenta: number, cantidad: number): Promise<number> {
        const sql = 'UPDATE cuentas SET perfiles_en_uso = perfiles_en_uso + ? WHERE id_cuenta = ?';
        const [result]: any = await pool.execute(sql, [cantidad, id_cuenta]);
        return result.affectedRows;
    }
}

export default new CuentaRepository();