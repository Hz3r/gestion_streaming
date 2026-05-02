import NotificacionRepository from "../repositories/NotificacionRepository";
import { NotificacionDTO, CrearNotificacionDTO } from "../dtos/NotificacionDTO";

class NotificacionService {
    async obtenerNotificacionesUsuario(id_usuario: number): Promise<NotificacionDTO[]> {
        const notificaciones = await NotificacionRepository.obtenerPorUsuario(id_usuario);
        return notificaciones.map(ntf => ({
            ...ntf,
            leida: Boolean(ntf.leida)
        }));
    }

    async crearNotificacion(datos: CrearNotificacionDTO): Promise<number> {
        return await NotificacionRepository.crear(datos);
    }

    async marcarLeida(id_notificacion: number): Promise<void> {
        await NotificacionRepository.marcarComoLeida(id_notificacion);
    }

    async marcarTodasLeidas(id_usuario: number): Promise<void> {
        await NotificacionRepository.marcarTodasComoLeidas(id_usuario);
    }
}

export default new NotificacionService();
