import pool from '../config/db';
import Usuario from '../models/Usuario';


class UsuarioRepository{

    async buscarPorNombre(nombre:string): Promise<Usuario | null> {
        const sql = 'SELECT * FROM usuarios WHERE nombre = ?';
        const [rows] : any = await pool.execute(sql, [nombre]);
        if (rows.length === 0) return null;
        return rows[0] as Usuario;
    }

    async crear(usuario: Usuario): Promise<number> {
        const sql = 'INSERT INTO usuarios (nombre, contraseña, id_rol) VALUES (?, ?, ?)';
        const [result] : any = await pool.execute(sql, [usuario.nombre, usuario.contraseña, usuario.id_rol]);
        return result.insertId;
    }

    async eliminar(id:number):Promise<number>{
        const sql = 'DELETE FROM usuarios WHERE id_usuario = ?';
        const [result] : any = await pool.execute(sql, [id]);
        return result.affectedRows;
    } 

    async actualizar(id:number, usuario:Usuario):Promise<number>{
        const sql = 'UPDATE usuarios SET nombre = ?, contraseña = ?, id_rol = ? WHERE id_usuario = ?';
        const [result] : any = await pool.execute(sql, [usuario.nombre, usuario.contraseña, usuario.id_rol, id]);
        return result.affectedRows;
    }

    async obtenerTodos():Promise<Usuario[]>{
        const sql = 'SELECT * FROM usuarios';
        const [rows] : any = await pool.execute(sql);
        return rows as Usuario[];
    }

    async obtenerPorId(id:number):Promise<Usuario | null>{
        const sql = 'SELECT * FROM usuarios WHERE id_usuario = ?';
        const [rows] : any = await pool.execute(sql, [id]);
        if (rows.length === 0) return null;
        return rows[0] as Usuario;
    }


}

export default new UsuarioRepository();