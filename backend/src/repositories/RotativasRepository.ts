import pool from "../config/db.js";
import CuentasRotativasDetalles from "../models/CuentasRotativasDetalles.js";

class RotativasRepository {
    async crear(rotativa: CuentasRotativasDetalles): Promise<number> {
        const sql = `INSERT INTO cuentas_rotativas_detalles (
            id_cuenta_fija, fecha_cancelacion_requerida, estado_vigencia
        ) VALUES (?,?,?)`;
        
        const [result]: any = await pool.execute(sql, [
            rotativa.id_cuenta_fija, rotativa.fecha_cancelacion_requerida, 
            rotativa.estado_vigencia ?? 'Activo'
        ]);
        return result.insertId;
    }

    async obtenerPorCuenta(id_cuenta_fija: number): Promise<CuentasRotativasDetalles | null> {
        const sql = 'SELECT * FROM cuentas_rotativas_detalles WHERE id_cuenta_fija = ?';
        const [rows]: any = await pool.execute(sql, [id_cuenta_fija]);
        return rows.length > 0 ? rows[0] : null;
    }

    async actualizar(id: number, data: Partial<CuentasRotativasDetalles>): Promise<number> {
        const fields = [];
        const values = [];

        if (data.fecha_cancelacion_requerida !== undefined) { 
            fields.push('fecha_cancelacion_requerida = ?'); 
            values.push(data.fecha_cancelacion_requerida); 
        }
        if (data.estado_vigencia !== undefined) { 
            fields.push('estado_vigencia = ?'); 
            values.push(data.estado_vigencia); 
        }

        if (fields.length === 0) return 0;

        const sql = `UPDATE cuentas_rotativas_detalles SET ${fields.join(', ')} WHERE id_rotativa = ?`;
        values.push(id);

        const [result]: any = await pool.execute(sql, values);
        return result.affectedRows;
    }
}

export default new RotativasRepository();
