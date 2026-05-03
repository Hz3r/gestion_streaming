import pool from "../config/db";
import HistorialCredenciales from "../models/HistorialCredenciales";

class HistorialCredencialesRepository {
    async crear(historial: HistorialCredenciales): Promise<number> {
        const sql = `INSERT INTO historial_credenciales (
            id_cuenta, email_anterior, email_nuevo, pass_anterior, pass_nuevo
        ) VALUES (?,?,?,?,?)`;
        
        const [result]: any = await pool.execute(sql, [
            historial.id_cuenta, historial.email_anterior ?? null, historial.email_nuevo ?? null,
            historial.pass_anterior ?? null, historial.pass_nuevo ?? null
        ]);
        return result.insertId;
    }

    async obtenerPorCuenta(id_cuenta: number): Promise<HistorialCredenciales[]> {
        const sql = 'SELECT * FROM historial_credenciales WHERE id_cuenta = ? ORDER BY fecha_cambio DESC';
        const [rows]: any = await pool.execute(sql, [id_cuenta]);
        return rows;
    }
}

export default new HistorialCredencialesRepository();
