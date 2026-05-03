import pool from "../config/db";
import type { FinanzasResumenDTO, FinanzasPendienteDTO } from "../dtos/FinanzasDTO";

class FinanzasRepository {

    async obtenerResumenAnual(anio: number): Promise<FinanzasResumenDTO[]> {
        const sql = `
            SELECT 
                m.mes, 
                m.anio,
                COALESCE(t.ingresos_reales, 0)       AS ingresos_reales,
                COALESCE(t.ingresos_pendientes, 0)   AS ingresos_pendientes,
                COALESCE(t.ingresos_proyectados, 0)  AS ingresos_proyectados,
                COALESCE(e.inversiones, 0)           AS inversiones,
                COALESCE(e.gastos_perdidas, 0)       AS gastos_perdidas,
                (COALESCE(t.ingresos_reales, 0) 
                 - COALESCE(e.inversiones, 0) 
                 - COALESCE(e.gastos_perdidas, 0))   AS utilidad_neta
            FROM (
                SELECT DISTINCT MONTH(fecha_inicio) AS mes, YEAR(fecha_inicio) AS anio FROM contratos WHERE YEAR(fecha_inicio) = ?
                UNION
                SELECT DISTINCT MONTH(fecha_gasto)  AS mes, YEAR(fecha_gasto)  AS anio FROM egresos  WHERE YEAR(fecha_gasto)  = ?
            ) m
            LEFT JOIN (
                SELECT MONTH(fecha_inicio) AS mes, YEAR(fecha_inicio) AS anio,
                    SUM(CASE WHEN estado_pagado = 1 THEN precio_total ELSE 0 END) AS ingresos_reales,
                    SUM(CASE WHEN estado_pagado = 0 THEN precio_total ELSE 0 END) AS ingresos_pendientes,
                    SUM(precio_total) AS ingresos_proyectados
                FROM contratos WHERE YEAR(fecha_inicio) = ?
                GROUP BY YEAR(fecha_inicio), MONTH(fecha_inicio)
            ) t ON m.mes = t.mes AND m.anio = t.anio
            LEFT JOIN (
                SELECT 
                    MONTH(fecha_gasto) AS mes, 
                    YEAR(fecha_gasto)  AS anio,
                    SUM(CASE WHEN tipo_egreso = 'Inversion_Cuenta' THEN monto ELSE 0 END) AS inversiones,
                    SUM(CASE WHEN tipo_egreso IN ('Perdida_Baneo', 'Gasto_Operativo', 'Pago_Staff') THEN monto ELSE 0 END) AS gastos_perdidas
                FROM egresos
                WHERE YEAR(fecha_gasto) = ?
                GROUP BY YEAR(fecha_gasto), MONTH(fecha_gasto)
            ) e ON m.mes = e.mes AND m.anio = e.anio
            ORDER BY m.mes ASC
        `;
        const [rows]: any = await pool.execute(sql, [anio, anio, anio, anio]);
        return rows;
    }

    async obtenerResumenMensual(mes: number, anio: number): Promise<FinanzasResumenDTO | null> {
        const sql = `
            SELECT 
                ? AS mes, ? AS anio,
                COALESCE(t.ingresos_reales, 0)       AS ingresos_reales,
                COALESCE(t.ingresos_pendientes, 0)   AS ingresos_pendientes,
                COALESCE(t.ingresos_proyectados, 0)  AS ingresos_proyectados,
                COALESCE(e.inversiones, 0)           AS inversiones,
                COALESCE(e.gastos_perdidas, 0)       AS gastos_perdidas,
                (COALESCE(t.ingresos_reales, 0) 
                 - COALESCE(e.inversiones, 0) 
                 - COALESCE(e.gastos_perdidas, 0))   AS utilidad_neta
            FROM (SELECT 1) dummy
            LEFT JOIN (
                SELECT 
                    SUM(CASE WHEN estado_pagado = 1 THEN precio_total ELSE 0 END) AS ingresos_reales,
                    SUM(CASE WHEN estado_pagado = 0 THEN precio_total ELSE 0 END) AS ingresos_pendientes,
                    SUM(precio_total) AS ingresos_proyectados
                FROM contratos WHERE MONTH(fecha_inicio) = ? AND YEAR(fecha_inicio) = ?
            ) t ON 1=1
            LEFT JOIN (
                SELECT 
                    SUM(CASE WHEN tipo_egreso = 'Inversion_Cuenta' THEN monto ELSE 0 END) AS inversiones,
                    SUM(CASE WHEN tipo_egreso IN ('Perdida_Baneo', 'Gasto_Operativo', 'Pago_Staff') THEN monto ELSE 0 END) AS gastos_perdidas
                FROM egresos
                WHERE MONTH(fecha_gasto) = ? AND YEAR(fecha_gasto) = ?
            ) e ON 1=1
        `;
        const [rows]: any = await pool.execute(sql, [mes, anio, mes, anio, mes, anio]);
        return rows.length > 0 ? rows[0] : null;
    }

    async obtenerResumenGeneral(): Promise<FinanzasResumenDTO[]> {
        const sql = `
            SELECT 
                m.mes, m.anio,
                COALESCE(t.ingresos_reales, 0)       AS ingresos_reales,
                COALESCE(t.ingresos_pendientes, 0)   AS ingresos_pendientes,
                COALESCE(t.ingresos_proyectados, 0)  AS ingresos_proyectados,
                COALESCE(e.inversiones, 0)           AS inversiones,
                COALESCE(e.gastos_perdidas, 0)       AS gastos_perdidas,
                (COALESCE(t.ingresos_reales, 0) 
                 - COALESCE(e.inversiones, 0) 
                 - COALESCE(e.gastos_perdidas, 0))   AS utilidad_neta
            FROM (
                SELECT DISTINCT MONTH(fecha_inicio) AS mes, YEAR(fecha_inicio) AS anio FROM contratos
                UNION
                SELECT DISTINCT MONTH(fecha_gasto)  AS mes, YEAR(fecha_gasto)  AS anio FROM egresos
            ) m
            LEFT JOIN (
                SELECT MONTH(fecha_inicio) AS mes, YEAR(fecha_inicio) AS anio,
                    SUM(CASE WHEN estado_pagado = 1 THEN precio_total ELSE 0 END) AS ingresos_reales,
                    SUM(CASE WHEN estado_pagado = 0 THEN precio_total ELSE 0 END) AS ingresos_pendientes,
                    SUM(precio_total) AS ingresos_proyectados
                FROM contratos GROUP BY YEAR(fecha_inicio), MONTH(fecha_inicio)
            ) t ON m.mes = t.mes AND m.anio = t.anio
            LEFT JOIN (
                SELECT 
                    MONTH(fecha_gasto) AS mes, YEAR(fecha_gasto) AS anio,
                    SUM(CASE WHEN tipo_egreso = 'Inversion_Cuenta' THEN monto ELSE 0 END) AS inversiones,
                    SUM(CASE WHEN tipo_egreso IN ('Perdida_Baneo', 'Gasto_Operativo', 'Pago_Staff') THEN monto ELSE 0 END) AS gastos_perdidas
                FROM egresos
                GROUP BY YEAR(fecha_gasto), MONTH(fecha_gasto)
            ) e ON m.mes = e.mes AND m.anio = e.anio
            ORDER BY m.anio DESC, m.mes DESC
        `;
        const [rows]: any = await pool.execute(sql);
        return rows;
    }

    async obtenerPendientesMensual(mes: number, anio: number): Promise<FinanzasPendienteDTO[]> {
        const sql = `
            SELECT 
                c.id_contrato,
                cl.nombre  AS nombre_cliente,
                c.fecha_inicio,
                c.fecha_vencimiento,
                c.precio_total,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'email_cuenta', cu.email,
                        'nombre_plataforma', p.nombre,
                        'perfiles_alquilados', cd.perfiles_alquilados
                    )
                ) AS detalles
            FROM contratos c
            INNER JOIN clientes    cl ON c.id_cliente    = cl.id_cliente
            LEFT JOIN contratos_detalles cd ON c.id_contrato = cd.id_contrato
            LEFT JOIN cuentas cu ON cd.id_cuenta = cu.id_cuenta
            LEFT JOIN plataformas p ON cu.id_plataforma = p.id_plataforma
            WHERE c.estado_pagado = 0 
              AND MONTH(c.fecha_inicio) = ? 
              AND YEAR(c.fecha_inicio)  = ?
            GROUP BY c.id_contrato
            ORDER BY c.precio_total DESC
        `;
        const [rows]: any = await pool.execute(sql, [mes, anio]);
        return rows;
    }
}

export default new FinanzasRepository();
