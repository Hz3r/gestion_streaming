import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Lock, Mail, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

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
      <div className="login-card">
        
        {/* LOGO BANKDASH STYLE */}
        <div className="login-header">
          <div className="login-logo-icon">🎬</div>
          <h1 className="login-title">STREAMEASE</h1>
        </div>

        <div className="login-body">
          <h2 className="login-subtitle">Bienvenido de nuevo</h2>
          <p className="login-description">Ingresa tus credenciales de administrador para acceder al panel de control.</p>
          
          <form onSubmit={handleLogin} className="login-form">
            
            {error && (
              <div className="login-error-alert">
                {error}
              </div>
            )}

            <div className="input-group">
              <label htmlFor="email">Correo Electrónico</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  id="email"
                  placeholder="admin@streamease.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-wrapper">
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

            <button 
              type="submit" 
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="login-footer">
          <p>© {new Date().getFullYear()} StreamEase Dashboard. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
