import pool from "../config/db";
import Metodo_Pago from "../models/Metodo_Pago";


class Metodo_PagoRepository {
    
    async crear(metodo_pago: Metodo_Pago): Promise<number> {
        const sql = `INSERT INTO metodo_pago (nombre) VALUES (?)`;
        const [result]: any = await pool.execute(sql, [metodo_pago.nombre]);
        return result.insertId;
    }

    async obtenerTodos(): Promise<Metodo_Pago[]> {
        const sql = 'SELECT id_metodo_pago, nombre FROM metodo_pago';
        const [rows]: any = await pool.execute(sql);
        return rows;
    }

    async obtenerPorId(id: number): Promise<Metodo_Pago | null> {
        const sql = 'SELECT id_metodo_pago, nombre FROM metodo_pago WHERE id_metodo_pago = ?';
        const [rows]: any = await pool.execute(sql, [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    async actualizar(id: number, metodo_pago: Metodo_Pago): Promise<number> {
        const sql = 'UPDATE metodo_pago SET nombre = ? WHERE id_metodo_pago = ?';
        const [result]: any = await pool.execute(sql, [metodo_pago.nombre, id]);
        return result.affectedRows;
    }

    async eliminar(id: number): Promise<number> {
        const sql = 'DELETE FROM metodo_pago WHERE id_metodo_pago = ?';
        const [result]: any = await pool.execute(sql, [id]);
        return result.affectedRows;
    }
}

export default new Metodo_PagoRepository();