import Cuentas from "../models/Cuentas.js";
import pool from "../config/db.js";

class CuentaRepository {

    async crearCuenta(cuentas: Cuentas): Promise<number> {
        const sql = `INSERT INTO cuentas (
            email, contraseña, fecha_compra, fecha_expiracion, 
            id_plataforma, id_proveedor, estado, capacidad_total,
            costo_total, meses_duracion, es_lank
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`;
        const [result]: any = await pool.execute(sql, [
            cuentas.email, cuentas.contraseña, cuentas.fecha_compra, cuentas.fecha_expiracion, 
            cuentas.id_plataforma, cuentas.id_proveedor, cuentas.estado, cuentas.capacidad_total,
            cuentas.costo_total, cuentas.meses_duracion, cuentas.es_lank ? 1 : 0
        ]);
        return result.insertId;
    }

    async obtenerTodas(): Promise<any[]> {
        const sql = `
            SELECT 
                c.*, 
                p.nombre as plataforma, 
                pr.nombre as proveedor,
                (SELECT fecha_cancelacion_requerida 
                 FROM cuentas_rotativas_detalles 
                 WHERE id_cuenta_fija = c.id_cuenta 
                 ORDER BY id_rotativa DESC LIMIT 1) as fecha_cancelacion_requerida
            FROM cuentas c
            INNER JOIN plataformas p ON c.id_plataforma = p.id_plataforma
            INNER JOIN proveedores pr ON c.id_proveedor = pr.id_proveedor
        `;
        const [rows]: any = await pool.execute(sql);
        return rows;
    }

    async obtenerPorId(id: number): Promise<any | null> {
        const sql = `
            SELECT 
                c.*, 
                p.nombre as plataforma, 
                pr.nombre as proveedor 
            FROM cuentas c
            INNER JOIN plataformas p ON c.id_plataforma = p.id_plataforma
            INNER JOIN proveedores pr ON c.id_proveedor = pr.id_proveedor
            WHERE c.id_cuenta = ?
        `;
        const [rows]: any = await pool.execute(sql, [id ?? null]);
        return rows.length > 0 ? rows[0] : null;
    }

    async actualizar(id: number, cuentas: Cuentas): Promise<number> {
        const sql = `UPDATE cuentas SET 
            email = ?, contraseña = ?, fecha_compra = ?, fecha_expiracion = ?, 
            id_plataforma = ?, id_proveedor = ?, estado = ?, capacidad_total = ?,
            costo_total = ?, meses_duracion = ?, es_lank = ? 
            WHERE id_cuenta = ?`;
        const [result]: any = await pool.execute(sql, [
            cuentas.email, cuentas.contraseña, cuentas.fecha_compra, cuentas.fecha_expiracion, 
            cuentas.id_plataforma, cuentas.id_proveedor, cuentas.estado, cuentas.capacidad_total,
            cuentas.costo_total, cuentas.meses_duracion, cuentas.es_lank ? 1 : 0, id
        ]);
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
        const [result]: any = await pool.execute(sql, [cantidad ?? 0, id_cuenta ?? null]);
        return result.affectedRows;
    }

    async obtenerProximasAVencer(dias: number): Promise<any[]> {
        const sql = `
            SELECT c.*, p.nombre as nombre_plataforma 
            FROM cuentas c
            INNER JOIN plataformas p ON c.id_plataforma = p.id_plataforma
            WHERE c.fecha_expiracion BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? DAY)
        `;
        const [rows]: any = await pool.execute(sql, [dias]);
        return rows;
    }

    async obtenerRotativasProximasACobro(dias: number): Promise<any[]> {
        const sql = `
            SELECT c.email, p.nombre as plataforma, crd.fecha_cancelacion_requerida, c.id_cuenta
            FROM cuentas_rotativas_detalles crd
            INNER JOIN cuentas c ON crd.id_cuenta_fija = c.id_cuenta
            INNER JOIN plataformas p ON c.id_plataforma = p.id_plataforma
            WHERE crd.fecha_cancelacion_requerida BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? DAY)
            AND crd.estado_vigencia = 'Activo'
        `;
        const [rows]: any = await pool.execute(sql, [dias]);
        return rows;
    }
}

export default new CuentaRepository();