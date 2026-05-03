import ContratoRepository from '../repositories/ContratoRepository.js';
import CuentaRepository from '../repositories/CuentaRepository.js';
import NotificacionRepository from '../repositories/NotificacionRepository.js';
import UsuarioRepository from '../repositories/UsuarioRepository.js';

class NotificacionService {

    /**
     * Escanea contratos y cuentas por vencer y genera notificaciones para los admins
     */
    async generarNotificacionesVencimiento() {
        try {
            console.log('--- Iniciando escaneo de vencimientos ---');
            
            // 1. Obtener todos los usuarios que deben recibir notificaciones (por ahora todos los registrados)
            const usuarios = await UsuarioRepository.obtenerTodos();
            if (usuarios.length === 0) return;

            // 2. Contratos que vencen en los próximos 3 días
            const contratos = await ContratoRepository.obtenerProximosAVencer(3);
            for (const c of contratos) {
                const titulo = 'Contrato por vencer';
                const mensaje = `El contrato de ${c.nombre_cliente} vence el ${c.fecha_vencimiento.toISOString().split('T')[0]}.`;
                
                for (const u of usuarios) {
                    await NotificacionRepository.crear({
                        id_usuario: u.id_usuario,
                        titulo,
                        mensaje,
                        tipo: 'warning',
                        link: `/contratos?id=${c.id_contrato}`
                    });
                }
            }

            // 3. Cuentas que vencen en los próximos 3 días
            const cuentas = await CuentaRepository.obtenerProximasAVencer(3);
            for (const ct of cuentas) {
                const titulo = 'Cuenta por vencer';
                const mensaje = `La cuenta ${ct.email} (${ct.nombre_plataforma}) vence el ${ct.fecha_expiracion.toISOString().split('T')[0]}.`;
                
                for (const u of usuarios) {
                    await NotificacionRepository.crear({
                        id_usuario: u.id_usuario,
                        titulo,
                        mensaje,
                        tipo: 'error', // Más crítico ya que afecta a varios perfiles
                        link: `/cuentas?id=${ct.id_cuenta}`
                    });
                }
            }

            // 4. Cuentas Rotativas con alerta de cobro próxima (2 días)
            const rotativas = await CuentaRepository.obtenerRotativasProximasACobro(2);
            for (const r of rotativas) {
                const titulo = '¡Alerta de Cobro! (Cuenta Rotativa)';
                const mensaje = `La cuenta ${r.email} (${r.plataforma}) debe cancelarse antes del ${r.fecha_cancelacion_requerida.toISOString().split('T')[0]} para evitar cobros.`;
                
                for (const u of usuarios) {
                    await NotificacionRepository.crear({
                        id_usuario: u.id_usuario,
                        titulo,
                        mensaje,
                        tipo: 'error',
                        link: `/cuentas-rotativas`
                    });
                }
            }

            console.log(`--- Escaneo finalizado: ${contratos.length} contratos, ${cuentas.length} cuentas y ${rotativas.length} rotativas procesadas ---`);
        } catch (error) {
            console.error('Error al generar notificaciones de vencimiento:', error);
        }
    }

    async obtenerNotificacionesUsuario(userId: number) {
        return await NotificacionRepository.obtenerPorUsuario(userId);
    }

    async marcarLeida(id: number) {
        return await NotificacionRepository.marcarComoLeida(id);
    }

    async marcarTodasLeidas(userId: number) {
        return await NotificacionRepository.marcarTodasComoLeidas(userId);
    }

    async crearNotificacion(datos: any) {
        return await NotificacionRepository.crear(datos);
    }

    async eliminar(id: number) {
        return await NotificacionRepository.eliminar(id);
    }

    async eliminarTodas(userId: number) {
        return await NotificacionRepository.eliminarTodasPorUsuario(userId);
    }
}

export default new NotificacionService();
