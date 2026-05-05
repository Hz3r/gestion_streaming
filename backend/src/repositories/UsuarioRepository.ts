import pool from '../config/db.js';
import Usuario from '../models/Usuario.js';


class UsuarioRepository{

    async buscarPorNombre(nombre:string): Promise<Usuario | null> {
        const sql = 'SELECT * FROM usuarios WHERE nombre = ?';
        const [rows] : any = await pool.execute(sql, [nombre]);
        if (rows.length === 0) return null;
        return rows[0] as Usuario;
    }

    async buscarPorEmail(email:string): Promise<Usuario | null> {
        const sql = `
            SELECT u.*, r.permisos 
            FROM usuarios u
            INNER JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.email = ?
        `;
        const [rows] : any = await pool.execute(sql, [email]);
        if (rows.length === 0) return null;
        return rows[0] as Usuario;
    }

    async crear(usuario: Usuario): Promise<number> {
        const sql = 'INSERT INTO usuarios (nombre, email, contraseña, id_rol, foto_perfil) VALUES (?, ?, ?, ?, ?)';
        const [result] : any = await pool.execute(sql, [usuario.nombre, usuario.email, usuario.contraseña, usuario.id_rol, usuario.foto_perfil]);
        return result.insertId;
    }

    async eliminar(id:number):Promise<number>{
        const sql = 'DELETE FROM usuarios WHERE id_usuario = ?';
        const [result] : any = await pool.execute(sql, [id]);
        return result.affectedRows;
    } 

    async actualizar(id:number, usuario:Usuario):Promise<number>{
        const sql = 'UPDATE usuarios SET nombre = ?, email = ?, id_rol = ? WHERE id_usuario = ?';
        const [result] : any = await pool.execute(sql, [usuario.nombre, usuario.email, usuario.id_rol, id]);
        return result.affectedRows;
    }

    async actualizarPerfil(id:number, nombre:string, email:string, foto_perfil?:string):Promise<number>{
        const sql = 'UPDATE usuarios SET nombre = ?, email = ?, foto_perfil = ? WHERE id_usuario = ?';
        const [result] : any = await pool.execute(sql, [nombre, email, foto_perfil || null, id]);
        return result.affectedRows;
    }

    async actualizarPassword(id:number, passwordNueva:string):Promise<number>{
        const sql = 'UPDATE usuarios SET contraseña = ? WHERE id_usuario = ?';
        const [result] : any = await pool.execute(sql, [passwordNueva, id]);
        return result.affectedRows;
    }

    async obtenerTodos():Promise<Usuario[]>{
        const sql = `
            SELECT u.*, r.permisos 
            FROM usuarios u
            INNER JOIN roles r ON u.id_rol = r.id_rol
        `;
        const [rows] : any = await pool.execute(sql);
        return rows as Usuario[];
    }


    async obtenerPorId(id: number): Promise<Usuario | null> {
        const sql = `
            SELECT u.*, r.nombre as rol 
            FROM usuarios u
            INNER JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.id_usuario = ?
        `;
        const [rows] : any = await pool.execute(sql, [id]);
        if (rows.length === 0) return null;
        return rows[0] as Usuario;
    }

    async obtenerEstadisticas(id: number): Promise<{ total_contratos: number }> {
        const sql = 'SELECT COUNT(*) as total FROM contratos WHERE id_usuario = ?';
        const [rows]: any = await pool.execute(sql, [id]);
        return { total_contratos: rows[0].total || 0 };
    }


}

export default new UsuarioRepository();