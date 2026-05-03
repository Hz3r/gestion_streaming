import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCircle, AlertTriangle, Info, XCircle, Clock } from "lucide-react";
import { getNotificaciones, marcarNotificacionLeida, marcarTodasLeidas } from "../../services/dashboardService";
import { useAuth } from "../../context/AuthContext";
import { useConfig } from "../../context/ConfigContext";

interface Notification {
    id_notificacion: number;
    titulo: string;
    mensaje: string;
    tipo: "success" | "warning" | "info" | "error";
    fecha_creacion: string;
    leida: boolean;
}

const NotificationBell: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const { config } = useConfig();
    const ID_USUARIO = user?.id;

    // Filtrar notificaciones según la configuración
    const filteredNotifications = notifications.filter(ntf => {
        if (config.notificaciones === 'none') return false;
        if (config.notificaciones === 'vencimiento') {
            // Asumiendo que las de vencimiento tienen un título o tipo específico
            return ntf.titulo.toLowerCase().includes('vencimiento') || ntf.mensaje.toLowerCase().includes('vence');
        }
        return true; // mode 'all'
    });

    const unreadCount = filteredNotifications.filter(n => !n.leida).length;

    useEffect(() => {
        if (!ID_USUARIO || config.notificaciones === 'none') return;
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [ID_USUARIO, config.notificaciones]);

    const fetchNotifications = async () => {
        if (!ID_USUARIO) return;
        try {
            const res = await getNotificaciones(ID_USUARIO);
            setNotifications(res.data);
        } catch (error) {
            console.error("Error al cargar notificaciones:", error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAllAsRead = async () => {
        if (!ID_USUARIO) return;
        try {
            await marcarTodasLeidas(ID_USUARIO);
            fetchNotifications();
        } catch (error) {
            console.error("Error al marcar todas como leídas:", error);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await marcarNotificacionLeida(id);
            fetchNotifications();
        } catch (error) {
            console.error("Error al marcar notificación:", error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "success": return <CheckCircle size={16} className="ntf-icon--success" />;
            case "warning": return <AlertTriangle size={16} className="ntf-icon--warning" />;
            case "error": return <XCircle size={16} className="ntf-icon--error" />;
            case "info": return <Info size={16} className="ntf-icon--info" />;
            default: return <Info size={16} className="ntf-icon--info" />;
        }
    };

    const formatTime = (dateStr: string) => {
        try {
            const options: Intl.DateTimeFormatOptions = { 
                timeZone: config.zona_horaria || 'America/Lima',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            };
            
            const date = new Date(dateStr);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMin = Math.floor(diffMs / 60000);
            
            if (diffMin < 1) return "Recién";
            if (diffMin < 60) return `Hace ${diffMin} min`;
            const diffHrs = Math.floor(diffMin / 60);
            if (diffHrs < 24) return `Hace ${diffHrs} h`;
            
            return new Intl.DateTimeFormat('es-ES', { 
                ...options, 
                day: '2-digit', 
                month: '2-digit' 
            }).format(date);
        } catch (e) {
            return new Date(dateStr).toLocaleDateString();
        }
    };

    // Si las notificaciones están desactivadas, no mostramos nada
    if (config.notificaciones === 'none') return null;

    return (
        <div className="notification-container" ref={dropdownRef}>
            <button 
                className={`notification-bell ${isOpen ? "notification-bell--active" : ""}`} 
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notificaciones"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="notification-bell__badge">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-dropdown__header">
                        <h5>Notificaciones</h5>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead}>Marcar todas como leídas</button>
                        )}
                    </div>
                    
                    <div className="notification-dropdown__list">
                        {filteredNotifications.length === 0 ? (
                            <div className="notification-empty">
                                <Bell size={32} />
                                <p>No hay alertas relevantes</p>
                            </div>
                        ) : (
                            filteredNotifications.map(ntf => (
                                <div 
                                    key={ntf.id_notificacion} 
                                    className={`notification-item ${!ntf.leida ? "notification-item--unread" : ""}`}
                                    onClick={() => !ntf.leida && handleMarkAsRead(ntf.id_notificacion)}
                                >
                                    <div className="notification-item__icon">
                                        {getIcon(ntf.tipo)}
                                    </div>
                                    <div className="notification-item__content">
                                        <p className="notification-item__title">{ntf.titulo}</p>
                                        <p className="notification-item__message">{ntf.mensaje}</p>
                                        <div className="notification-item__meta">
                                            <Clock size={12} />
                                            <span>{formatTime(ntf.fecha_creacion)}</span>
                                        </div>
                                    </div>
                                    {!ntf.leida && <div className="notification-item__dot" />}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="notification-dropdown__footer">
                        <Link to="/notificaciones" className="btn-view-all" onClick={() => setIsOpen(false)}>
                            Ver todas las alertas
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;


