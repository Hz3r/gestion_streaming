import pool from "../config/db";
import type { FinanzasResumenDTO, FinanzasPendienteDTO } from "../dtos/FinanzasDTO";

class FinanzasRepository {

    // Obtener resumen financiero de todos los meses
    async obtenerResumenGeneral(): Promise<FinanzasResumenDTO[]> {
        const sql = `SELECT 
            MONTH(fecha_inicio) as mes, 
            YEAR(fecha_inicio) as anio,
            SUM(CASE WHEN estado_pagado = 1 THEN precio_total ELSE 0 END) as ingresos_reales,
            SUM(CASE WHEN estado_pagado = 0 THEN precio_total ELSE 0 END) as ingresos_pendientes,
            SUM(precio_total) as ingresos_proyectados
        FROM contratos
        GROUP BY YEAR(fecha_inicio), MONTH(fecha_inicio)
        ORDER BY anio DESC, mes DESC`;
        const [rows]: any = await pool.execute(sql);
        return rows;
    }

    // Obtener resumen financiero de un mes/año específico
    async obtenerResumenMensual(mes: number, anio: number): Promise<FinanzasResumenDTO | null> {
        const sql = `SELECT 
            MONTH(fecha_inicio) as mes, 
            YEAR(fecha_inicio) as anio,
            SUM(CASE WHEN estado_pagado = 1 THEN precio_total ELSE 0 END) as ingresos_reales,
            SUM(CASE WHEN estado_pagado = 0 THEN precio_total ELSE 0 END) as ingresos_pendientes,
            SUM(precio_total) as ingresos_proyectados
        FROM contratos
        WHERE MONTH(fecha_inicio) = ? AND YEAR(fecha_inicio) = ?
        GROUP BY YEAR(fecha_inicio), MONTH(fecha_inicio)`;
        const [rows]: any = await pool.execute(sql, [mes, anio]);
        return rows.length > 0 ? rows[0] : null;
    }

    // Obtener resumen financiero de un año completo
    async obtenerResumenAnual(anio: number): Promise<FinanzasResumenDTO[]> {
        const sql = `SELECT 
            MONTH(fecha_inicio) as mes, 
            YEAR(fecha_inicio) as anio,
            SUM(CASE WHEN estado_pagado = 1 THEN precio_total ELSE 0 END) as ingresos_reales,
            SUM(CASE WHEN estado_pagado = 0 THEN precio_total ELSE 0 END) as ingresos_pendientes,
            SUM(precio_total) as ingresos_proyectados
        FROM contratos
        WHERE YEAR(fecha_inicio) = ?
        GROUP BY YEAR(fecha_inicio), MONTH(fecha_inicio)
        ORDER BY mes ASC`;
        const [rows]: any = await pool.execute(sql, [anio]);
        return rows;
    }

    // Obtener detalle de contratos pendientes de un mes/año
    async obtenerPendientesMensual(mes: number, anio: number): Promise<FinanzasPendienteDTO[]> {
        const sql = `SELECT 
            c.id_contrato,
            u.nombre AS nombre_cliente,
            cu.email AS email_cuenta,
            p.nombre AS nombre_plataforma,
            c.perfiles_alquilados,
            c.fecha_inicio,
            c.fecha_vencimiento,
            c.precio_total
        FROM contratos c
        INNER JOIN usuarios u ON c.id_cliente = u.id_usuario
        INNER JOIN cuentas cu ON c.id_cuenta = cu.id_cuenta
        INNER JOIN plataformas p ON cu.id_plataforma = p.id_plataforma
        WHERE c.estado_pagado = 0 
          AND MONTH(c.fecha_inicio) = ? 
          AND YEAR(c.fecha_inicio) = ?
        ORDER BY c.precio_total DESC`;
        const [rows]: any = await pool.execute(sql, [mes, anio]);
        return rows;
    }
}

export default new FinanzasRepository();
