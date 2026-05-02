import React, { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle, AlertTriangle, Info, XCircle, Clock } from "lucide-react";
import { getNotificaciones, marcarNotificacionLeida, marcarTodasLeidas } from "../../services/dashboardService";

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
    
    // Asumimos ID 1 por ahora hasta tener login real
    const ID_USUARIO = 1;

    const unreadCount = notifications.filter(n => !n.leida).length;

    useEffect(() => {
        fetchNotifications();
        // Polling simple cada 30 segundos (opcional, mejor sockets luego)
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
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
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        
        if (diffMin < 1) return "Recién";
        if (diffMin < 60) return `Hace ${diffMin} min`;
        const diffHrs = Math.floor(diffMin / 60);
        if (diffHrs < 24) return `Hace ${diffHrs} h`;
        return date.toLocaleDateString();
    };

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
                        {notifications.length === 0 ? (
                            <div className="notification-empty">
                                <Bell size={32} />
                                <p>No tienes notificaciones</p>
                            </div>
                        ) : (
                            notifications.map(ntf => (
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
                        <button className="btn-view-all">Ver todas las alertas</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;


