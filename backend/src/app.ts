import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';

// Importar rutas
import usuarioRoutes from './routes/usuarioRoutes';
import rolRoutes from './routes/rolRoutes';
import plataformaRoutes from './routes/PlataformaRoutes';
import metodo_pagoRoutes from './routes/Metodo_PagoRoutes';
import proveedorRoutes from './routes/ProveedorRoutes';
import clienteRoutes from './routes/ClienteRoutes';
import cuentasRoutes from './routes/CuentaRoutes';
import contratosRoutes from './routes/ContratosRoutes';
import finanzasRoutes from './routes/FinanzasRoutes';
import configuracionRoutes from './routes/configuracionRoutes';
import notificacionRoutes from './routes/notificacionRoutes';


const app = express();


// Middlewares de seguridad y utilidad
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(compression());
app.use(cookieParser());

// Parseo de JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
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


// Ruta de salud
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

export default app;
