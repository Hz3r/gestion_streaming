import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import NotificacionService from './services/NotificacionService';

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    
    // Ejecutar escaneo de vencimientos al iniciar
    try {
        await NotificacionService.generarNotificacionesVencimiento();
    } catch (e) {
        console.error("Error inicializando notificaciones:", e);
    }

    // Escaneo periódico cada 12 horas
    setInterval(async () => {
        try {
            await NotificacionService.generarNotificacionesVencimiento();
        } catch (e) {
            console.error("Error en escaneo periódico:", e);
        }
    }, 12 * 60 * 60 * 1000);
});
