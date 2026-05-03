import { Router } from "express";
import LankController from "../controllers/LankController";
// Asumiendo que existe un middleware de autenticación/roles
// import authMiddleware from "../middlewares/authMiddleware";
// import roleMiddleware from "../middlewares/roleMiddleware";

const router = Router();

// Endpoints de Sincronización n8n (Puede requerir API Key o Auth específica)
router.post('/sync', LankController.syncFromN8n);

// CRUD
router.post('/', LankController.crear);
router.get('/', LankController.obtenerTodas);
router.get('/:id', LankController.obtenerPorId);
router.put('/:id', LankController.actualizar);
router.delete('/:id', LankController.eliminar);

export default router;
