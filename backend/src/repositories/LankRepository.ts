import pool from "../config/db.js";
import LankCuentasMadre from "../models/LankCuentasMadre.js";

class LankRepository {
    async crear(lank: LankCuentasMadre): Promise<number> {
        const sql = `INSERT INTO lank_cuentas_madre (
            correo, password, metodo_acceso, numero_vinculado, verificado, 
            yape_numero, monto_farming, bono_activo, estado_baneo, 
            fecha_desbaneo, plataformas_activas, pagado
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;
        
        const plataformasJson = lank.plataformas_activas ? JSON.stringify(lank.plataformas_activas) : null;
        
        const [result]: any = await pool.execute(sql, [
            lank.correo, lank.password ?? null, lank.metodo_acceso ?? 'Manual', 
            lank.numero_vinculado ?? null, lank.verificado ? 1 : 0,
            lank.yape_numero ?? null, lank.monto_farming ?? 0.00, 
            lank.bono_activo ? 1 : 0, lank.estado_baneo ?? 'Limpio',
            lank.fecha_desbaneo ?? null, plataformasJson,
            lank.pagado ? 1 : 0
        ]);
        return result.insertId;
    }

    async obtenerTodas(): Promise<LankCuentasMadre[]> {
        const sql = 'SELECT * FROM lank_cuentas_madre';
        const [rows]: any = await pool.execute(sql);
        return rows;
    }

    async obtenerPorId(id: number): Promise<LankCuentasMadre | null> {
        const sql = 'SELECT * FROM lank_cuentas_madre WHERE id_lank_madre = ?';
        const [rows]: any = await pool.execute(sql, [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    async obtenerPorCorreo(correo: string): Promise<LankCuentasMadre | null> {
        const sql = 'SELECT * FROM lank_cuentas_madre WHERE correo = ?';
        const [rows]: any = await pool.execute(sql, [correo]);
        return rows.length > 0 ? rows[0] : null;
    }

    async actualizar(id: number, lank: Partial<LankCuentasMadre>): Promise<number> {
        const fields = [];
        const values = [];

        if (lank.correo !== undefined) { fields.push('correo = ?'); values.push(lank.correo); }
        if (lank.password !== undefined) { fields.push('password = ?'); values.push(lank.password); }
        if (lank.metodo_acceso !== undefined) { fields.push('metodo_acceso = ?'); values.push(lank.metodo_acceso); }
        if (lank.numero_vinculado !== undefined) { fields.push('numero_vinculado = ?'); values.push(lank.numero_vinculado); }
        if (lank.verificado !== undefined) { fields.push('verificado = ?'); values.push(lank.verificado ? 1 : 0); }
        if (lank.yape_numero !== undefined) { fields.push('yape_numero = ?'); values.push(lank.yape_numero); }
        if (lank.monto_farming !== undefined) { fields.push('monto_farming = ?'); values.push(lank.monto_farming); }
        if (lank.bono_activo !== undefined) { fields.push('bono_activo = ?'); values.push(lank.bono_activo ? 1 : 0); }
        if (lank.estado_baneo !== undefined) { fields.push('estado_baneo = ?'); values.push(lank.estado_baneo); }
        if (lank.fecha_desbaneo !== undefined) { fields.push('fecha_desbaneo = ?'); values.push(lank.fecha_desbaneo); }
        if (lank.plataformas_activas !== undefined) { 
            fields.push('plataformas_activas = ?'); 
            values.push(lank.plataformas_activas ? JSON.stringify(lank.plataformas_activas) : null); 
        }
        if (lank.pagado !== undefined) { fields.push('pagado = ?'); values.push(lank.pagado ? 1 : 0); }

        if (fields.length === 0) return 0;

        const sql = `UPDATE lank_cuentas_madre SET ${fields.join(', ')} WHERE id_lank_madre = ?`;
        values.push(id);

        const [result]: any = await pool.execute(sql, values);
        return result.affectedRows;
    }

    async eliminar(id: number): Promise<number> {
        const sql = 'DELETE FROM lank_cuentas_madre WHERE id_lank_madre = ?';
        const [result]: any = await pool.execute(sql, [id]);
        return result.affectedRows;
    }

    async cerrarMes(mes: number, anio: number, cobrado: number, proyectado: number): Promise<number> {
        const sql = `
            INSERT INTO lank_ingresos_historico (mes, anio, monto_total, monto_cobrado, monto_proyectado) 
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                monto_total = VALUES(monto_total),
                monto_cobrado = VALUES(monto_cobrado),
                monto_proyectado = VALUES(monto_proyectado)
        `;
        const [result]: any = await pool.execute(sql, [mes, anio, cobrado, cobrado, proyectado]);
        return result.insertId;
    }

    async eliminarCierreMes(mes: number, anio: number): Promise<number> {
        const sql = 'DELETE FROM lank_ingresos_historico WHERE mes = ? AND anio = ?';
        const [result]: any = await pool.execute(sql, [mes, anio]);
        return result.affectedRows;
    }
}

export default new LankRepository();
