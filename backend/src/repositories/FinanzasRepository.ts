import pool from "../config/db";
import type { FinanzasResumenDTO, FinanzasPendienteDTO } from "../dtos/FinanzasDTO";

class FinanzasRepository {

    async obtenerResumenAnual(anio: number, tipo: string = 'Global'): Promise<FinanzasResumenDTO[]> {
        let filtroContrato = "";
        let filtroEgreso = "";
        if (tipo === 'Directas') {
            filtroContrato = " AND tipo_contrato = 'Directo'";
            filtroEgreso = " AND (c.es_lank = 0 OR e.id_cuenta IS NULL)";
        } else if (tipo === 'Lank') {
            filtroContrato = " AND tipo_contrato = 'Lank'";
            filtroEgreso = " AND c.es_lank = 1";
        }

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
                UNION
                SELECT DISTINCT mes, anio FROM lank_ingresos_historico WHERE anio = ?
            ) m
            LEFT JOIN (
                SELECT MONTH(fecha_inicio) AS mes, YEAR(fecha_inicio) AS anio,
                    SUM(CASE WHEN estado_pagado = 1 THEN precio_total ELSE 0 END) AS ingresos_reales,
                    SUM(CASE WHEN estado_pagado = 0 THEN precio_total ELSE 0 END) AS ingresos_pendientes,
                    SUM(precio_total) AS ingresos_proyectados
                FROM contratos WHERE YEAR(fecha_inicio) = ? ${filtroContrato}
                GROUP BY YEAR(fecha_inicio), MONTH(fecha_inicio)
            ) t ON m.mes = t.mes AND m.anio = t.anio
            LEFT JOIN (
                SELECT 
                    MONTH(e.fecha_gasto) AS mes, 
                    YEAR(e.fecha_gasto)  AS anio,
                    SUM(CASE WHEN e.tipo_egreso = 'Inversion_Cuenta' THEN e.monto ELSE 0 END) AS inversiones,
                    SUM(CASE WHEN e.tipo_egreso IN ('Perdida_Baneo', 'Gasto_Operativo', 'Pago_Staff') THEN e.monto ELSE 0 END) AS gastos_perdidas
                FROM egresos e
                LEFT JOIN cuentas c ON e.id_cuenta = c.id_cuenta
                WHERE YEAR(e.fecha_gasto) = ? ${filtroEgreso}
                GROUP BY YEAR(e.fecha_gasto), MONTH(e.fecha_gasto)
            ) e ON m.mes = e.mes AND m.anio = e.anio
            ORDER BY m.mes ASC
        `;
        const [rows]: any = await pool.execute(sql, [anio, anio, anio, anio, anio]);

        // Add lank_ingresos_historico if Global or Lank
        if (tipo === 'Global' || tipo === 'Lank') {
            const sqlLank = 'SELECT mes, anio, SUM(monto_cobrado) as cobrado, SUM(monto_proyectado) as proyectado FROM lank_ingresos_historico WHERE anio = ? GROUP BY mes, anio';
            const [lankRows]: any = await pool.execute(sqlLank, [anio]);
            
            // Dinámica actual
            const now = new Date();
            const curMes = now.getMonth() + 1;
            const curAnio = now.getFullYear();
            let dynCobrado = 0;
            let dynProyectado = 0;
            if (anio === curAnio) {
                const [dyn]: any = await pool.execute('SELECT SUM(CASE WHEN pagado = 1 THEN monto_farming + IF(bono_activo = 1, 94.40, 0) ELSE 0 END) as cobrado, SUM(monto_farming + IF(bono_activo = 1, 94.40, 0)) as proyectado FROM lank_cuentas_madre');
                dynCobrado = dyn[0].cobrado || 0;
                dynProyectado = dyn[0].proyectado || 0;
            }

            for (const r of rows) {
                const lankIncome = lankRows.find((l: any) => l.mes === r.mes && l.anio === r.anio);
                let mLankReales = 0;
                let mLankProy = 0;
                
                if (lankIncome) {
                    mLankReales = parseFloat(lankIncome.cobrado);
                    mLankProy = parseFloat(lankIncome.proyectado);
                } else if (r.mes === curMes && r.anio === curAnio) {
                    mLankReales = parseFloat(dynCobrado as any);
                    mLankProy = parseFloat(dynProyectado as any);
                }

                if (mLankProy > 0) {
                    r.ingresos_reales = parseFloat(r.ingresos_reales) + mLankReales;
                    r.ingresos_proyectados = parseFloat(r.ingresos_proyectados) + mLankProy;
                    r.ingresos_pendientes = parseFloat(r.ingresos_pendientes) + (mLankProy - mLankReales);
                    r.utilidad_neta = parseFloat(r.utilidad_neta) + mLankReales;
                }
            }
        }
        return rows;
    }

    async obtenerResumenMensual(mes: number, anio: number, tipo: string = 'Global'): Promise<FinanzasResumenDTO | null> {
        let filtroContrato = "";
        let filtroEgreso = "";
        if (tipo === 'Directas') {
            filtroContrato = " AND tipo_contrato = 'Directo'";
            filtroEgreso = " AND (c.es_lank = 0 OR e.id_cuenta IS NULL)";
        } else if (tipo === 'Lank') {
            filtroContrato = " AND tipo_contrato = 'Lank'";
            filtroEgreso = " AND c.es_lank = 1";
        }

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
                FROM contratos WHERE MONTH(fecha_inicio) = ? AND YEAR(fecha_inicio) = ? ${filtroContrato}
            ) t ON 1=1
            LEFT JOIN (
                SELECT 
                    SUM(CASE WHEN e.tipo_egreso = 'Inversion_Cuenta' THEN e.monto ELSE 0 END) AS inversiones,
                    SUM(CASE WHEN e.tipo_egreso IN ('Perdida_Baneo', 'Gasto_Operativo', 'Pago_Staff') THEN e.monto ELSE 0 END) AS gastos_perdidas
                FROM egresos e
                LEFT JOIN cuentas c ON e.id_cuenta = c.id_cuenta
                WHERE MONTH(e.fecha_gasto) = ? AND YEAR(e.fecha_gasto) = ? ${filtroEgreso}
            ) e ON 1=1
        `;
        const [rows]: any = await pool.execute(sql, [mes, anio, mes, anio, mes, anio]);
        let result = rows.length > 0 ? rows[0] : null;

        if (result && (tipo === 'Global' || tipo === 'Lank')) {
            const sqlLank = 'SELECT SUM(monto_cobrado) as cobrado, SUM(monto_proyectado) as proyectado FROM lank_ingresos_historico WHERE mes = ? AND anio = ?';
            const [lankRows]: any = await pool.execute(sqlLank, [mes, anio]);
            let mLankReales = 0;
            let mLankProy = 0;

            if (lankRows.length > 0 && lankRows[0].proyectado) {
                mLankReales = parseFloat(lankRows[0].cobrado);
                mLankProy = parseFloat(lankRows[0].proyectado);
            } else {
                const now = new Date();
                if (mes === (now.getMonth() + 1) && anio === now.getFullYear()) {
                    const [dyn]: any = await pool.execute('SELECT SUM(CASE WHEN pagado = 1 THEN monto_farming + IF(bono_activo = 1, 94.40, 0) ELSE 0 END) as cobrado, SUM(monto_farming + IF(bono_activo = 1, 94.40, 0)) as proyectado FROM lank_cuentas_madre');
                    mLankReales = dyn[0].cobrado || 0;
                    mLankProy = dyn[0].proyectado || 0;
                }
            }

            if (mLankProy > 0) {
                result.ingresos_reales = parseFloat(result.ingresos_reales) + mLankReales;
                result.ingresos_proyectados = parseFloat(result.ingresos_proyectados) + mLankProy;
                result.ingresos_pendientes = parseFloat(result.ingresos_pendientes) + (mLankProy - mLankReales);
                result.utilidad_neta = parseFloat(result.utilidad_neta) + mLankReales;
            }
        }
        return result;
    }

    async obtenerResumenGeneral(tipo: string = 'Global'): Promise<FinanzasResumenDTO[]> {
        let filtroContrato = "";
        let filtroEgreso = "";
        if (tipo === 'Directas') {
            filtroContrato = " WHERE tipo_contrato = 'Directo'";
            filtroEgreso = " WHERE (c.es_lank = 0 OR e.id_cuenta IS NULL)";
        } else if (tipo === 'Lank') {
            filtroContrato = " WHERE tipo_contrato = 'Lank'";
            filtroEgreso = " WHERE c.es_lank = 1";
        }

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
                UNION
                SELECT DISTINCT mes, anio FROM lank_ingresos_historico
            ) m
            LEFT JOIN (
                SELECT MONTH(fecha_inicio) AS mes, YEAR(fecha_inicio) AS anio,
                    SUM(CASE WHEN estado_pagado = 1 THEN precio_total ELSE 0 END) AS ingresos_reales,
                    SUM(CASE WHEN estado_pagado = 0 THEN precio_total ELSE 0 END) AS ingresos_pendientes,
                    SUM(precio_total) AS ingresos_proyectados
                FROM contratos ${filtroContrato} GROUP BY YEAR(fecha_inicio), MONTH(fecha_inicio)
            ) t ON m.mes = t.mes AND m.anio = t.anio
            LEFT JOIN (
                SELECT 
                    MONTH(e.fecha_gasto) AS mes, YEAR(e.fecha_gasto) AS anio,
                    SUM(CASE WHEN e.tipo_egreso = 'Inversion_Cuenta' THEN e.monto ELSE 0 END) AS inversiones,
                    SUM(CASE WHEN e.tipo_egreso IN ('Perdida_Baneo', 'Gasto_Operativo', 'Pago_Staff') THEN e.monto ELSE 0 END) AS gastos_perdidas
                FROM egresos e
                LEFT JOIN cuentas c ON e.id_cuenta = c.id_cuenta
                ${filtroEgreso}
                GROUP BY YEAR(e.fecha_gasto), MONTH(e.fecha_gasto)
            ) e ON m.mes = e.mes AND m.anio = e.anio
            ORDER BY m.anio DESC, m.mes DESC
        `;
        const [rows]: any = await pool.execute(sql);

        if (tipo === 'Global' || tipo === 'Lank') {
            const sqlLank = 'SELECT mes, anio, SUM(monto_cobrado) as cobrado, SUM(monto_proyectado) as proyectado FROM lank_ingresos_historico GROUP BY mes, anio';
            const [lankRows]: any = await pool.execute(sqlLank);
            
            const now = new Date();
            const curMes = now.getMonth() + 1;
            const curAnio = now.getFullYear();
            const [dyn]: any = await pool.execute('SELECT SUM(CASE WHEN pagado = 1 THEN monto_farming + IF(bono_activo = 1, 94.40, 0) ELSE 0 END) as cobrado, SUM(monto_farming + IF(bono_activo = 1, 94.40, 0)) as proyectado FROM lank_cuentas_madre');
            const dynCobrado = dyn[0].cobrado || 0;
            const dynProyectado = dyn[0].proyectado || 0;

            for (const r of rows) {
                const lankIncome = lankRows.find((l: any) => l.mes === r.mes && l.anio === r.anio);
                let mLankReales = 0;
                let mLankProy = 0;
                if (lankIncome) {
                    mLankReales = parseFloat(lankIncome.cobrado);
                    mLankProy = parseFloat(lankIncome.proyectado);
                } else if (r.mes === curMes && r.anio === curAnio) {
                    mLankReales = parseFloat(dynCobrado as any);
                    mLankProy = parseFloat(dynProyectado as any);
                }

                if (mLankProy > 0) {
                    r.ingresos_reales = parseFloat(r.ingresos_reales) + mLankReales;
                    r.ingresos_proyectados = parseFloat(r.ingresos_proyectados) + mLankProy;
                    r.ingresos_pendientes = parseFloat(r.ingresos_pendientes) + (mLankProy - mLankReales);
                    r.utilidad_neta = parseFloat(r.utilidad_neta) + mLankReales;
                }
            }
        }
        return rows;
    }

    async obtenerPendientesMensual(mes: number, anio: number, tipo: string = 'Global'): Promise<FinanzasPendienteDTO[]> {
        let filtroContrato = "";
        if (tipo === 'Directas') {
            filtroContrato = " AND c.tipo_contrato = 'Directo'";
        } else if (tipo === 'Lank') {
            filtroContrato = " AND c.tipo_contrato = 'Lank'";
        }

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
              ${filtroContrato}
            GROUP BY c.id_contrato
            ORDER BY c.precio_total DESC
        `;
        const [rows]: any = await pool.execute(sql, [mes, anio]);
        return rows;
    }
}

export default new FinanzasRepository();
