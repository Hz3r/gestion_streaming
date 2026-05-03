import pool from "../config/db";
import Cliente from "../models/Cliente";

class ClienteRepository {
    async crear(cliente: Cliente): Promise<number> {
        const sql = 'INSERT INTO clientes (nombre, telefono, estado, tipo) VALUES (?,?,?,?)';
        const [result]: any = await pool.execute(sql, [
            cliente.nombre, cliente.telefono, cliente.estado, cliente.tipo || 'Directo'
        ]);
        return result.insertId;
    }

    async obtenerTodos(): Promise<Cliente[]> {
        const sql = 'SELECT * FROM clientes';
        const [rows]: any = await pool.execute(sql);
        return rows;
    }

    async obtenerPorId(id: number): Promise<Cliente | null> {
        const sql = 'SELECT * FROM clientes WHERE id_cliente = ?';
        const [rows]: any = await pool.execute(sql, [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    async actualizar(id: number, cliente: Cliente): Promise<number> {
        const sql = 'UPDATE clientes SET nombre = ?, telefono = ?, estado = ?, tipo = ? WHERE id_cliente = ?';
        const [result]: any = await pool.execute(sql, [
            cliente.nombre, cliente.telefono, cliente.estado, cliente.tipo || 'Directo', id
        ]);
        return result.affectedRows;
    }

    async eliminar(id: number): Promise<number> {
        const sql = 'DELETE FROM clientes WHERE id_cliente = ?';
        const [result]: any = await pool.execute(sql, [id]);
        return result.affectedRows;
    }
}

export default new ClienteRepository();
