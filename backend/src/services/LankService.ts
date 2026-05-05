import LankRepository from "../repositories/LankRepository.js";
import LankCuentasMadre from "../models/LankCuentasMadre.js";
import ContratoRepository from "../repositories/ContratoRepository.js";
import CuentaRepository from "../repositories/CuentaRepository.js";
import pool from "../config/db.js";

class LankService {
    async crearCuenta(data: LankCuentasMadre): Promise<number> {
        return await LankRepository.crear(data);
    }

    async obtenerTodas(): Promise<LankCuentasMadre[]> {
        return await LankRepository.obtenerTodas();
    }

    async obtenerPorId(id: number): Promise<LankCuentasMadre | null> {
        return await LankRepository.obtenerPorId(id);
    }

    async actualizar(id: number, data: Partial<LankCuentasMadre>): Promise<number> {
        return await LankRepository.actualizar(id, data);
    }

    async eliminar(id: number): Promise<number> {
        return await LankRepository.eliminar(id);
    }

    async cerrarMes(mes: number, anio: number): Promise<void> {
        // Obtenemos la suma cobrado y proyectado (94.40 si bono_activo = 1)
        const sql = `
            SELECT 
                SUM(CASE WHEN pagado = 1 THEN monto_farming + IF(bono_activo = 1, 94.40, 0) ELSE 0 END) as cobrado,
                SUM(monto_farming + IF(bono_activo = 1, 94.40, 0)) as proyectado 
            FROM lank_cuentas_madre
        `;
        const [rows]: any = await pool.execute(sql);
        const cobrado = rows[0].cobrado || 0;
        const proyectado = rows[0].proyectado || 0;

        await LankRepository.cerrarMes(mes, anio, cobrado, proyectado);
    }

    async eliminarCierreMes(mes: number, anio: number): Promise<number> {
        return await LankRepository.eliminarCierreMes(mes, anio);
    }

    // Endpoint de Sincronización para n8n
    async syncFromN8n(payload: any): Promise<any> {
        const { id_lank_madre, correo, plataformas_activas, monto_farming, bono_activo, nuevos_clientes } = payload;

        let cuentaMadre = null;
        
        if (id_lank_madre) {
            cuentaMadre = await LankRepository.obtenerPorId(id_lank_madre);
        } else if (correo) {
            cuentaMadre = await LankRepository.obtenerPorCorreo(correo);
        }

        if (!cuentaMadre) {
            throw new Error("Cuenta madre no encontrada en la base de datos.");
        }

        const idReal = cuentaMadre.id_lank_madre!;

        // 1. Actualizar estado en LankCuentasMadre
        await LankRepository.actualizar(idReal, {
            plataformas_activas: plataformas_activas,
            monto_farming: monto_farming,
            bono_activo: bono_activo
        });

        // 2. Sincronización de Clientes (Supabase -> MySQL)
        // Se asume que n8n envía un array de nuevos_clientes con formato: { id_cuenta, id_contrato, perfiles_alquilados }
        if (nuevos_clientes && Array.isArray(nuevos_clientes)) {
            for (const cliente of nuevos_clientes) {
                if (cliente.id_cuenta && cliente.id_contrato) {
                    // Verificar si ya existe en detalles
                    const sqlCheck = 'SELECT * FROM contratos_detalles WHERE id_contrato = ? AND id_cuenta = ?';
                    const [rows]: any = await pool.execute(sqlCheck, [cliente.id_contrato, cliente.id_cuenta]);
                    
                    if (rows.length === 0) {
                        // Insertar en contratos_detalles
                        const sqlInsert = 'INSERT INTO contratos_detalles (id_contrato, id_cuenta, perfiles_alquilados) VALUES (?,?,?)';
                        await pool.execute(sqlInsert, [cliente.id_contrato, cliente.id_cuenta, cliente.perfiles_alquilados || 1]);
                        
                        // Ocupar perfiles en la cuenta
                        await CuentaRepository.actualizarPerfilesEnUso(cliente.id_cuenta, cliente.perfiles_alquilados || 1);
                    }
                }
            }
        }

        return { success: true, message: "Sincronización de Lank completada", id_lank_madre: idReal };
    }
}

export default new LankService();
