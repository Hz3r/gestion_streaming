import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Lock, Mail, LogIn, ShieldCheck, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { config } = useConfig();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data && response.data.token) {
        login(response.data.token, response.data.usuario);
      } else {
        setError('Respuesta inválida del servidor.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background-overlay"></div>
      
      <div className="login-card">
        <div className="login-card-inner">
          
          <div className="login-header">
            <div className="login-logo-container">
              {config.logo_url ? (
                <img src={config.logo_url} alt="Logo" className="login-custom-logo" />
              ) : (
                <div className="login-logo-placeholder">
                  <ShieldCheck size={32} />
                </div>
              )}
            </div>
            <h1 className="login-company-name">{config.titulo_sitio || 'Sistema de Gestión'}</h1>
            <p className="login-system-tagline">{config.subtitulo_sitio || 'Panel Administrativo'}</p>
          </div>

          <div className="login-divider">
            <span>Acceso Seguro</span>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            
            {error && (
              <div className="login-error-message">
                <span className="error-dot"></span>
                {error}
              </div>
            )}

            <div className="form-field">
              <label htmlFor="email">Usuario Empresarial</label>
              <div className="input-control">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  id="email"
                  placeholder="nombre@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="password">Contraseña</label>
              <div className="input-control">
                <Lock className="input-icon" size={18} />
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Recordar sesión</span>
              </label>
              <a href="#" className="forgot-password">¿Olvidó su contraseña?</a>
            </div>

            <button 
              type="submit" 
              className="corporate-login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="btn-spinner"></div>
              ) : (
                <>
                  <span>Entrar al Sistema</span>
                  <LogIn size={18} />
                </>
              )}
            </button>
          </form>

          <div className="login-footer-info">
            <div className="footer-links">
              <a href="#"><Globe size={14} /> Soporte Técnico</a>
              <span>•</span>
              <a href="#">Privacidad</a>
            </div>
            <p className="copyright-text">
              © {new Date().getFullYear()} {config.titulo_sitio}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
