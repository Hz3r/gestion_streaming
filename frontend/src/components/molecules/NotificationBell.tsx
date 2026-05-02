import React from "react";
import { Bell } from "lucide-react";

interface NotificationBellProps {
    count?: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ count = 0 }) => {
    return (
        <button className="notification-bell" id="header-notifications" aria-label="Notificaciones">
            <Bell size={20} />
            {count > 0 && (
                <span className="notification-bell__badge">
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </button>
    );
};

export default NotificationBell;
