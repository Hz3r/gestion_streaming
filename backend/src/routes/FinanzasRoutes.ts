import { Router } from "express";
import FinanzasController from "../controllers/FinanzasController.js";

const router = Router();

// Resumen general (todos los meses disponibles)
router.get('/resumen', FinanzasController.obtenerResumenGeneral);

// Resumen anual (12 meses de un año)
router.get('/resumen/:anio', FinanzasController.obtenerResumenAnual);

// Resumen mensual específico
router.get('/resumen/:anio/:mes', FinanzasController.obtenerResumenMensual);

// Detalle de contratos pendientes de un mes
router.get('/pendientes/:anio/:mes', FinanzasController.obtenerPendientesMensual);

// Registrar pago de staff (Cerrar Mes)
router.post('/cerrar-mes', FinanzasController.cerrarMes);

export default router;
