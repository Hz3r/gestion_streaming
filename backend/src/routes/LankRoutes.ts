import { Router } from "express";
import LankController from "../controllers/LankController.js";
import { checkPermission } from "../middlewares/authMiddleware.js";
import { PERMISOS } from "../constants/Permisos.js";

const router = Router();

// Endpoints de Sincronización n8n
router.post('/sync', LankController.syncFromN8n);

// CRUD y Operaciones Financieras
router.post('/cerrar-mes', checkPermission(PERMISOS.LANK_CLOSE_MONTH), LankController.cerrarMes);
router.post('/eliminar-cierre', checkPermission(PERMISOS.LANK_DELETE_HISTORY), LankController.eliminarCierreMes);
router.post('/', checkPermission(PERMISOS.LANK_EDIT), LankController.crear);
router.get('/', LankController.obtenerTodas);
router.get('/:id', LankController.obtenerPorId);
router.put('/:id', checkPermission(PERMISOS.LANK_EDIT), LankController.actualizar);
router.delete('/:id', checkPermission(PERMISOS.CUENTAS_DELETE), LankController.eliminar);

export default router;
