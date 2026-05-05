import pool from "../config/db.js";
import Plataforma from "../models/Plataforma.js";

class PlataformaRepository{

    async crear(plataforma:Plataforma):Promise<number>{
        const sql = 'INSERT INTO plataformas(nombre) VALUES(?)';
        const [result]:any = await pool.execute(sql, [plataforma.nombre]);
        return result.insertId;
    }

    async obtenerTodas():Promise<Plataforma[]>{
        const sql = 'SELECT id_plataforma, nombre FROM plataformas';
        const [rows]:any = await pool.execute(sql);
        return rows;
    }

    async obtenerPorId(id:number):Promise<Plataforma | null>{
        const sql = 'SELECT id_plataforma, nombre FROM plataformas WHERE id_plataforma = ?';
        const [rows]:any = await pool.execute(sql, [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    async actualizar(id:number, plataforma:Plataforma):Promise<number>{
        const sql = 'UPDATE plataformas SET nombre = ? WHERE id_plataforma = ?';
        const [result]:any = await pool.execute(sql, [plataforma.nombre, id]);
        return result.affectedRows;
    }

    async eliminar(id:number):Promise<number>{
        const sql = 'DELETE FROM plataformas WHERE id_plataforma = ?';
        const [result]:any = await pool.execute(sql, [id]);
        return result.affectedRows;
    }
}

export default new PlataformaRepository();
