import { Router } from "express";
import NotificacionController from "../controllers/NotificacionController.js";

const router = Router();

router.get("/usuario/:id_usuario", NotificacionController.obtenerPorUsuario);
router.put("/:id/leer", NotificacionController.marcarLeida);
router.put("/usuario/:id_usuario/leer-todas", NotificacionController.marcarTodasLeidas);
router.delete("/:id", NotificacionController.eliminar);
router.delete("/usuario/:id_usuario/limpiar", NotificacionController.eliminarTodas);
router.post("/", NotificacionController.crear);

export default router;
