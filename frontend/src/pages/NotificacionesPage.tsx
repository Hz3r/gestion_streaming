import { useEffect, useState } from "react";
import { Bell, Trash2, CheckCircle, ExternalLink, Calendar, AlertCircle } from "lucide-react";
import { getNotificaciones, marcarNotificacionLeida, marcarTodasLeidas } from "../services/dashboardService";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "../components/common/ConfirmDialog";
import api from "../services/api";

type Notificacion = {
  id_notificacion: number;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  leida: boolean;
  link: string;
  fecha_creacion: string;
};

const NotificacionesPage = () => {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotificaciones();
    }
  }, [user]);

  const fetchNotificaciones = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await getNotificaciones(user.id);
      setNotificaciones(res.data);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarLeida = async (id: number) => {
    try {
      await marcarNotificacionLeida(id);
      setNotificaciones(prev => 
        prev.map(n => n.id_notificacion === id ? { ...n, leida: true } : n)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await api.delete(`/notificaciones/${id}`);
      setNotificaciones(prev => prev.filter(n => n.id_notificacion !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleLimpiarTodo = async () => {
    if (!user) return;
    try {
      await api.delete(`/notificaciones/usuario/${user.id}/limpiar`);
      setNotificaciones([]);
      setConfirmOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarcarTodasLeidas = async () => {
    if (!user) return;
    try {
      await marcarTodasLeidas(user.id);
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'error': return <AlertCircle className="text-error-500" size={20} />;
      case 'warning': return <AlertCircle className="text-warning-500" size={20} />;
      case 'success': return <CheckCircle className="text-success-500" size={20} />;
      default: return <Bell className="text-info-500" size={20} />;
    }
  };

  return (
    <div className="notificaciones-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-action-outline" onClick={handleMarcarTodasLeidas} disabled={notificaciones.every(n => n.leida)}>
            <CheckCircle size={18} />
            Marcar todo leído
          </button>
          <button className="btn-action-outline" onClick={() => setConfirmOpen(true)} style={{ color: 'var(--color-error-500)', borderColor: 'var(--color-error-500)' }}>
            <Trash2 size={18} />
            Limpiar Historial
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loader-container">Cargando notificaciones...</div>
      ) : notificaciones.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '100px 0', background: 'var(--bg-secondary)', borderRadius: '12px', border: '2px dashed var(--border-color)' }}>
          <Bell size={64} style={{ color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.3 }} />
          <h3>No tienes notificaciones</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Te avisaremos cuando haya algo importante que requiera tu atención.</p>
        </div>
      ) : (
        <div className="notificaciones-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {notificaciones.map((n) => (
            <div 
              key={n.id_notificacion} 
              className={`notificacion-card ${!n.leida ? 'unread' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '20px',
                padding: '20px',
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                borderLeft: `4px solid ${n.leida ? 'var(--border-color)' : `var(--color-${n.tipo === 'error' ? 'error' : n.tipo === 'warning' ? 'warning' : 'info'}-500)`}`,
                transition: 'transform 0.2s',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div className="notificacion-icon-box" style={{ 
                padding: '10px', 
                background: 'var(--bg-primary)', 
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {getIcon(n.tipo)}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{n.titulo}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={14} />
                    {new Date(n.fecha_creacion).toLocaleString()}
                  </span>
                </div>
                <p style={{ margin: '0 0 15px 0', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{n.mensaje}</p>
                
                <div style={{ display: 'flex', gap: '15px' }}>
                  {n.link && (
                    <a href={n.link} className="btn-link" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-primary-500)', textDecoration: 'none', fontWeight: 600 }}>
                      Ver detalle <ExternalLink size={14} />
                    </a>
                  )}
                  {!n.leida && (
                    <button onClick={() => handleMarcarLeida(n.id_notificacion)} style={{ background: 'none', border: 'none', color: 'var(--color-success-500)', fontSize: '0.9rem', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
                      Marcar como leída
                    </button>
                  )}
                  <button onClick={() => handleEliminar(n.id_notificacion)} style={{ background: 'none', border: 'none', color: 'var(--color-error-500)', fontSize: '0.9rem', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
                    Borrar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleLimpiarTodo}
        title="Limpiar Historial"
        message="¿Estás seguro de eliminar todas las notificaciones? Esta acción no se puede deshacer."
        confirmLabel="Limpiar todo"
      />
    </div>
  );
};

export default NotificacionesPage;
