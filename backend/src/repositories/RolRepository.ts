import pool from '../config/db';
import Rol from '../models/Roles';


class RolRepository {

    async obtenerTodos(): Promise<Rol[]> {
        const sql = 'SELECT * FROM roles';
        const [rows]: any = await pool.execute(sql);
        return rows.map((row: any) => ({
            ...row,
            permisos: typeof row.permisos === 'string' ? JSON.parse(row.permisos) : row.permisos
        })) as Rol[];
    }

    async obtenerPorId(id: number): Promise<Rol | null> {
        const sql = 'SELECT * FROM roles WHERE id_rol = ?';
        const [rows]: any = await pool.execute(sql, [id]);
        if (rows.length === 0) return null;
        const row = rows[0];
        return {
            ...row,
            permisos: typeof row.permisos === 'string' ? JSON.parse(row.permisos) : row.permisos
        } as Rol;
    }

    async buscarPorNombre(nombre: string): Promise<Rol | null> {
        const sql = 'SELECT * FROM roles WHERE nombre = ?';
        const [rows]: any = await pool.execute(sql, [nombre]);
        if (rows.length === 0) return null;
        const row = rows[0];
        return {
            ...row,
            permisos: typeof row.permisos === 'string' ? JSON.parse(row.permisos) : row.permisos
        } as Rol;
    }

    async crear(rol: Rol): Promise<number> {
        const sql = 'INSERT INTO roles (nombre, permisos) VALUES (?, ?)';
        const permisosJson = rol.permisos ? JSON.stringify(rol.permisos) : '[]';
        const [result]: any = await pool.execute(sql, [rol.nombre, permisosJson]);
        return result.insertId;
    }

    async actualizar(id: number, rol: Rol): Promise<boolean> {
        const sql = 'UPDATE roles SET nombre = ?, permisos = ? WHERE id_rol = ?';
        const permisosJson = rol.permisos ? JSON.stringify(rol.permisos) : '[]';
        const [result]: any = await pool.execute(sql, [rol.nombre, permisosJson, id]);
        return result.affectedRows > 0;
    }

    async eliminar(id: number): Promise<boolean> {
        const sql = 'DELETE FROM roles WHERE id_rol = ?';
        const [result]: any = await pool.execute(sql, [id]);
        return result.affectedRows > 0;
    }

}

export default new RolRepository();
