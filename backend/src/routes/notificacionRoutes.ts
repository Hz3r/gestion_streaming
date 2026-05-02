import { Router } from "express";
import NotificacionController from "../controllers/NotificacionController";

const router = Router();

router.get("/usuario/:id_usuario", NotificacionController.obtenerPorUsuario);
router.put("/:id/leer", NotificacionController.marcarLeida);
router.put("/usuario/:id_usuario/leer-todas", NotificacionController.marcarTodasLeidas);
router.post("/", NotificacionController.crear);

export default router;
