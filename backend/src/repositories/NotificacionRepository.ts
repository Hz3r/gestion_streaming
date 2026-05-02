import pool from "../config/db";
import Notificacion from "../models/Notificacion";
import { CrearNotificacionDTO } from "../dtos/NotificacionDTO";

class NotificacionRepository {
    async obtenerPorUsuario(id_usuario: number): Promise<Notificacion[]> {
        const sql = 'SELECT * FROM notificaciones WHERE id_usuario = ? ORDER BY fecha_creacion DESC LIMIT 50';
        const [rows]: any = await pool.execute(sql, [id_usuario]);
        return rows as Notificacion[];
    }

    async crear(datos: CrearNotificacionDTO): Promise<number> {
        const sql = 'INSERT INTO notificaciones (id_usuario, titulo, mensaje, tipo, link) VALUES (?, ?, ?, ?, ?)';
        const [result]: any = await pool.execute(sql, [datos.id_usuario, datos.titulo, datos.mensaje, datos.tipo, datos.link || null]);
        return result.insertId;
    }

    async marcarComoLeida(id_notificacion: number): Promise<void> {
        const sql = 'UPDATE notificaciones SET leida = TRUE WHERE id_notificacion = ?';
        await pool.execute(sql, [id_notificacion]);
    }

    async marcarTodasComoLeidas(id_usuario: number): Promise<void> {
        const sql = 'UPDATE notificaciones SET leida = TRUE WHERE id_usuario = ?';
        await pool.execute(sql, [id_usuario]);
    }

    async eliminarAntiguas(dias: number): Promise<void> {
        const sql = 'DELETE FROM notificaciones WHERE fecha_creacion < DATE_SUB(NOW(), INTERVAL ? DAY)';
        await pool.execute(sql, [dias]);
    }
}

export default new NotificacionRepository();
