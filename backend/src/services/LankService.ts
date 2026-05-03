import LankRepository from "../repositories/LankRepository";
import LankCuentasMadre from "../models/LankCuentasMadre";
import ContratoRepository from "../repositories/ContratoRepository";
import CuentaRepository from "../repositories/CuentaRepository";
import pool from "../config/db";

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
