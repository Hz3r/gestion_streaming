import FinanzasService from "../services/FinanzasService";
import { Request, Response } from "express";

class FinanzasController {

    // GET /api/finanzas/resumen — Resumen general de todos los meses
    async obtenerResumenGeneral(req: Request, res: Response) {
        try {
            const resumen = await FinanzasService.obtenerResumenGeneral();
            res.status(200).json(resumen);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    // GET /api/finanzas/resumen/:anio — Resumen de un año completo
    async obtenerResumenAnual(req: Request, res: Response) {
        try {
            const anio = parseInt(req.params.anio as string);
            const resumen = await FinanzasService.obtenerResumenAnual(anio);
            res.status(200).json(resumen);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    // GET /api/finanzas/resumen/:anio/:mes — Resumen de un mes específico
    async obtenerResumenMensual(req: Request, res: Response) {
        try {
            const mes = parseInt(req.params.mes as string);
            const anio = parseInt(req.params.anio as string);
            const resumen = await FinanzasService.obtenerResumenMensual(mes, anio);
            res.status(200).json(resumen);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    // GET /api/finanzas/pendientes/:anio/:mes — Detalle de pendientes de un mes
    async obtenerPendientesMensual(req: Request, res: Response) {
        try {
            const mes = parseInt(req.params.mes as string);
            const anio = parseInt(req.params.anio as string);
            const pendientes = await FinanzasService.obtenerPendientesMensual(mes, anio);
            res.status(200).json(pendientes);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    // POST /api/finanzas/cerrar-mes — Registrar pago de staff
    async cerrarMes(req: Request, res: Response) {
        try {
            const { mes, anio, montoStaff } = req.body;
            await FinanzasService.cerrarMes(Number(mes), Number(anio), Number(montoStaff));
            res.status(201).json({ message: 'Mes cerrado con éxito y pago de staff registrado' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new FinanzasController();
