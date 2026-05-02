import pool from "../config/db";
import Egresos from "../models/Egresos";

class EgresoRepository {
    async crear(egreso: Egresos): Promise<number> {
        const sql = `INSERT INTO egresos (monto, tipo_egreso, descripcion, fecha_gasto, id_cuenta) VALUES (?, ?, ?, ?, ?)`;
        const [result]: any = await pool.execute(sql, [
            egreso.monto,
            egreso.tipo_egreso,
            egreso.descripcion,
            egreso.fecha_gasto,
            egreso.id_cuenta
        ]);
        return result.insertId;
    }

    async obtenerTodos(): Promise<any[]> {
        const sql = `
            SELECT e.*, c.email as email_cuenta 
            FROM egresos e
            LEFT JOIN cuentas c ON e.id_cuenta = c.id_cuenta
            ORDER BY e.fecha_gasto DESC
        `;
        const [rows]: any = await pool.execute(sql);
        return rows;
    }

    async obtenerPorMes(mes: number, anio: number): Promise<any[]> {
        const sql = `
            SELECT e.*, c.email as email_cuenta 
            FROM egresos e
            LEFT JOIN cuentas c ON e.id_cuenta = c.id_cuenta
            WHERE MONTH(e.fecha_gasto) = ? AND YEAR(e.fecha_gasto) = ?
            ORDER BY e.fecha_gasto DESC
        `;
        const [rows]: any = await pool.execute(sql, [mes, anio]);
        return rows;
    }

    async actualizarPorCuentaYTipo(id_cuenta: number, tipo: string, data: Partial<Egresos>): Promise<number> {
        const sql = `UPDATE egresos SET monto = ?, descripcion = ?, fecha_gasto = ? WHERE id_cuenta = ? AND tipo_egreso = ?`;
        const [result]: any = await pool.execute(sql, [data.monto, data.descripcion, data.fecha_gasto, id_cuenta, tipo]);
        return result.affectedRows;
    }

    async eliminarPorCuentaYTipo(id_cuenta: number, tipo: string): Promise<number> {
        const sql = `DELETE FROM egresos WHERE id_cuenta = ? AND tipo_egreso = ?`;
        const [result]: any = await pool.execute(sql, [id_cuenta, tipo]);
        return result.affectedRows;
    }

    async eliminarPorCuenta(id_cuenta: number): Promise<number> {
        const sql = `DELETE FROM egresos WHERE id_cuenta = ?`;
        const [result]: any = await pool.execute(sql, [id_cuenta]);
        return result.affectedRows;
    }

    async eliminar(id: number): Promise<number> {
        const sql = `DELETE FROM egresos WHERE id_egreso = ?`;
        const [result]: any = await pool.execute(sql, [id]);
        return result.affectedRows;
    }
}

export default new EgresoRepository();
