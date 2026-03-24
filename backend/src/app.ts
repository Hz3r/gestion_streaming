import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';

// Importar rutas
import usuarioRoutes from './routes/usuarioRoutes';
import rolRoutes from './routes/rolRoutes';

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

// Ruta de salud
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

export default app;
