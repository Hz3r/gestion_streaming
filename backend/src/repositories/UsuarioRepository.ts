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

}

export default new UsuarioRepository();