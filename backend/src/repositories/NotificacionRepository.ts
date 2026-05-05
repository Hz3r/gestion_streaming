import pool from "../config/db.js";
import Notificacion from "../models/Notificacion.js";
import { CrearNotificacionDTO } from "../dtos/NotificacionDTO.js";

class NotificacionRepository {
    async obtenerPorUsuario(id_usuario: number): Promise<Notificacion[]> {
        const sql = 'SELECT * FROM notificaciones WHERE id_usuario = ? ORDER BY fecha_creacion DESC LIMIT 50';
        const [rows]: any = await pool.execute(sql, [id_usuario]);
        return rows as Notificacion[];
    }

    async crear(datos: CrearNotificacionDTO): Promise<number> {
        // Verificar si ya existe una notificación idéntica para este usuario hoy
        const checkSql = 'SELECT id_notificacion FROM notificaciones WHERE id_usuario = ? AND titulo = ? AND mensaje = ? AND DATE(fecha_creacion) = CURDATE() LIMIT 1';
        const [existing]: any = await pool.execute(checkSql, [datos.id_usuario, datos.titulo, datos.mensaje]);
        
        if (existing.length > 0) return 0; // No duplicar

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

    async eliminar(id_notificacion: number): Promise<void> {
        const sql = 'DELETE FROM notificaciones WHERE id_notificacion = ?';
        await pool.execute(sql, [id_notificacion]);
    }

    async eliminarTodasPorUsuario(id_usuario: number): Promise<void> {
        const sql = 'DELETE FROM notificaciones WHERE id_usuario = ?';
        await pool.execute(sql, [id_usuario]);
    }

    async eliminarAntiguas(dias: number): Promise<void> {
        const sql = 'DELETE FROM notificaciones WHERE fecha_creacion < DATE_SUB(NOW(), INTERVAL ? DAY)';
        await pool.execute(sql, [dias]);
    }
}

export default new NotificacionRepository();
