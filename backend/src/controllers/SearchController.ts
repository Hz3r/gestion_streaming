import { Request, Response } from 'express';
import pool from '../config/db';

export const globalSearch = async (req: Request, res: Response) => {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const searchTerm = `%${q}%`;

    try {
        // Buscamos en Clientes, Cuentas y Contratos en paralelo
        const [clientes] = await pool.execute(
            'SELECT id_cliente as id, nombre as title, CONCAT("Cliente - ", tipo) as subtitle, "cliente" as type, "/clientes" as link FROM clientes WHERE nombre LIKE ? LIMIT 5',
            [searchTerm]
        );

        const [cuentas] = await pool.execute(
            'SELECT c.id_cuenta as id, c.email as title, CONCAT("Cuenta - ", p.nombre) as subtitle, "cuenta" as type, "/cuentas" as link FROM cuentas c JOIN plataformas p ON c.id_plataforma = p.id_plataforma WHERE c.email LIKE ? LIMIT 5',
            [searchTerm]
        );

        const [contratos] = await pool.execute(
            'SELECT c.id_contrato as id, CONCAT("Contrato #", c.id_contrato) as title, CONCAT("Cliente: ", cl.nombre) as subtitle, "contrato" as type, "/contratos" as link FROM contratos c JOIN clientes cl ON c.id_cliente = cl.id_cliente WHERE cl.nombre LIKE ? OR c.id_contrato LIKE ? LIMIT 5',
            [searchTerm, searchTerm]
        );

        // Combinamos todos los resultados
        const results = [
            ...(clientes as any[]),
            ...(cuentas as any[]),
            ...(contratos as any[])
        ];

        res.json(results);
    } catch (error: any) {
        console.error('Error en búsqueda global:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};
