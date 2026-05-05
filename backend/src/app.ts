import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';

// Importar rutas
import usuarioRoutes from './routes/usuarioRoutes.js';
import rolRoutes from './routes/rolRoutes.js';
import plataformaRoutes from './routes/PlataformaRoutes.js';
import metodo_pagoRoutes from './routes/Metodo_PagoRoutes.js';
import proveedorRoutes from './routes/ProveedorRoutes.js';
import clienteRoutes from './routes/ClienteRoutes.js';
import cuentasRoutes from './routes/CuentaRoutes.js';
import contratosRoutes from './routes/ContratosRoutes.js';
import finanzasRoutes from './routes/FinanzasRoutes.js';
import configuracionRoutes from './routes/configuracionRoutes.js';
import notificacionRoutes from './routes/notificacionRoutes.js';
import egresoRoutes from './routes/EgresoRoutes.js';
import lankRoutes from './routes/LankRoutes.js';
import rotativasRoutes from './routes/RotativasRoutes.js';
import authRoutes from './routes/AuthRoutes.js';
import searchRoutes from './routes/SearchRoutes.js';
import { authMiddleware } from './middlewares/authMiddleware.js';

const app = express();


// Middlewares de seguridad y utilidad
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(compression());
app.use(cookieParser());

// Parseo de JSON y formularios
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rutas
app.use('/api/auth', authRoutes);

// Proteger todas las rutas de API con authMiddleware (excepto auth que ya lo maneja o tiene excepciones)
app.use('/api', authMiddleware);

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/roles', rolRoutes);
app.use('/api/plataformas', plataformaRoutes);
app.use('/api/metodos_pago', metodo_pagoRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/cuentas', cuentasRoutes);
app.use('/api/contratos', contratosRoutes);
app.use('/api/finanzas', finanzasRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/egresos', egresoRoutes);
app.use('/api/lank', lankRoutes);
app.use('/api/rotativas', rotativasRoutes);
app.use('/api/search', searchRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

export default app;
