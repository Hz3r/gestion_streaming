import ContratoService from "../services/ContratoService";
import { Request, Response } from "express";

class ContratosController {

    async crear(req: Request, res: Response) {
        try {
            const datos = req.body;
            const resultado = await ContratoService.crearContrato(datos);
            res.status(201).json({
                message: 'Contrato creado con éxito',
                data: resultado
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async obtenerTodos(req: Request, res: Response) {
        try {
            const contratos = await ContratoService.obtenerTodos();
            res.status(200).json(contratos);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async obtenerPorId(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            const contrato = await ContratoService.obtenerPorId(id);
            res.status(200).json(contrato);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async obtenerDetalleTodos(req: Request, res: Response) {
        try {
            const detalles = await ContratoService.obtenerDetalleTodos();
            res.status(200).json(detalles);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async obtenerDetallePorId(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            const detalle = await ContratoService.obtenerDetallePorId(id);
            res.status(200).json(detalle);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async obtenerPorCliente(req: Request, res: Response) {
        try {
            const id_cliente = parseInt(req.params.id_cliente as string);
            const contratos = await ContratoService.obtenerPorCliente(id_cliente);
            res.status(200).json(contratos);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async obtenerPorCuenta(req: Request, res: Response) {
        try {
            const id_cuenta = parseInt(req.params.id_cuenta as string);
            const contratos = await ContratoService.obtenerPorCuenta(id_cuenta);
            res.status(200).json(contratos);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async actualizar(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            const datos = req.body;
            const resultado = await ContratoService.actualizarContrato(id, datos);
            res.status(200).json({
                message: 'Contrato actualizado con éxito',
                data: resultado
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async eliminar(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            await ContratoService.eliminarContrato(id);
            res.status(200).json({ message: 'Contrato eliminado con éxito' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new ContratosController();
