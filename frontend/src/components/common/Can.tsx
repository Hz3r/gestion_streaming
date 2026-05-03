import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface CanProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Componente para renderizado condicional basado en permisos
 */
const Can: React.FC<CanProps> = ({ permission, children, fallback = null }) => {
    const { hasPermission } = useAuth();

    if (hasPermission(permission)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};

export default Can;
