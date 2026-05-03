import React, { useState } from "react"
import NavLink from "../atom/NavLink"
import { 
    Home, Users, Tv, CreditCard, Truck, UserCheck, 
    FileText, BarChart3, Shield, User, Settings, 
    Server, RefreshCw, ChevronLeft, ChevronRight,
    LayoutDashboard, Briefcase, Database, Settings2
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { PERMISOS } from "../../constants/Permisos"
import { useConfig } from "../../context/ConfigContext"

const MENU_GROUPS = [
    {
        title: "principal",
        items: [
            { id: "dashboard", label: "dashboard", href: "/", icon: LayoutDashboard },
            { id: "finanzas", label: "finanzas", href: "/finanzas", icon: BarChart3, permission: PERMISOS.FINANZAS_VIEW },
        ]
    },
    {
        title: "gestion",
        items: [
            { id: "cuentas", label: "cuentas", href: "/cuentas", icon: Users, permission: PERMISOS.CUENTAS_VIEW },
            { id: "contratos", label: "contratos", href: "/contratos", icon: FileText, permission: PERMISOS.CONTRATOS_VIEW },
            { id: "clientes", label: "clientes", href: "/clientes", icon: UserCheck, permission: PERMISOS.CLIENTES_VIEW },
            { id: "proveedores", label: "proveedores", href: "/proveedores", icon: Truck, permission: PERMISOS.CUENTAS_VIEW },
        ]
    },
    {
        title: "infraestructura",
        items: [
            { id: "plataformas", label: "plataformas", href: "/plataformas", icon: Tv, permission: PERMISOS.CUENTAS_VIEW },
            { id: "metodo_pago", label: "metodo_pago", href: "/metodo_pago", icon: CreditCard, permission: PERMISOS.CUENTAS_VIEW },
            { id: "lank_farm", label: "lank_farm", href: "/lank-farm", icon: Server, permission: PERMISOS.LANK_VIEW },
            { id: "cuentas_rotativas", label: "cuentas_rotativas", href: "/cuentas-rotativas", icon: RefreshCw, permission: PERMISOS.CUENTAS_VIEW },
        ]
    },
    {
        title: "sistema",
        items: [
            { id: "usuarios", label: "usuarios", href: "/usuarios", icon: User, permission: PERMISOS.USUARIOS_MANAGE },
            { id: "roles", label: "roles", href: "/roles", icon: Shield, permission: PERMISOS.ROLES_MANAGE },
        ]
    }
]

const Sidebar: React.FC = () => {
    const { hasPermission } = useAuth();
    const { config, t } = useConfig();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside className={`sidebar ${isCollapsed ? "sidebar--collapsed" : ""}`}>
            {/* ─── Brand / Logo ─── */}
            <div className="sidebar__brand">
                <div className="sidebar__logo-container">
                    {config.logo_url ? (
                        <div className="sidebar__logo-wrapper">
                            <img src={config.logo_url} alt="Logo" className="sidebar__logo-img" />
                        </div>
                    ) : (
                        <div className="sidebar__logo-placeholder">
                            <Database size={24} color="var(--color-accent-cyan-500)" />
                        </div>
                    )}
                    {!isCollapsed && (
                        <div className="sidebar__brand-text">
                            <h2 className="sidebar__title">{config.titulo_sitio || "STREAMEASE"}</h2>
                            <span className="sidebar__subtitle">{config.subtitulo_sitio || "Management System"}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Botón Toggle ─── */}
            <button 
                className="sidebar__toggle" 
                onClick={() => setIsCollapsed(!isCollapsed)}
                title={isCollapsed ? "Expandir" : "Contraer"}
            >
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            {/* ─── Navegación por Grupos ─── */}
            <nav className="sidebar__nav">
                {MENU_GROUPS.map((group) => {
                    // Filtrar items por permiso
                    const visibleItems = group.items.filter(item => 
                        !item.permission || hasPermission(item.permission)
                    );

                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={group.title} className="sidebar__group">
                            {!isCollapsed && (
                                <h3 className="sidebar__group-title">{t(group.title).toUpperCase()}</h3>
                            )}
                            <ul className="sidebar__menu">
                                {visibleItems.map((item) => (
                                    <li key={item.id} className="sidebar__item">
                                        <NavLink
                                            label={isCollapsed ? "" : t(item.label)}
                                            href={item.href}
                                            icon={item.icon}
                                        />
                                        {isCollapsed && (
                                            <span className="sidebar__tooltip">{t(item.label)}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </nav>
        </aside>
    )
}

export default Sidebar
