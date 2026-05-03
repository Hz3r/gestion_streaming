import React from "react"
import NavLink from "../atom/NavLink"
import { Home, Users, Tv, CreditCard, Truck, UserCheck, FileText, BarChart3, Shield, User, Settings, Server, RefreshCw } from "lucide-react"

const MENU_ITEMS = [
    { label: "Dashboard", href: "/", icon: Home },
    { label: "Cuentas", href: "/cuentas", icon: Users },
    { label: "Plataformas", href: "/plataformas", icon: Tv },
    { label: "Metodo de Pago", href: "/metodo_pago", icon: CreditCard },
    { label: "Proveedores", href: "/proveedores", icon: Truck },
    { label: "Clientes", href: "/clientes", icon: UserCheck },
    { label: "Contratos", href: "/contratos", icon: FileText },
    { label: "Finanzas", href: "/finanzas", icon: BarChart3 },
    { label: "Granja Lank", href: "/lank-farm", icon: Server },
    { label: "Rotativas", href: "/cuentas-rotativas", icon: RefreshCw },
    { label: "Roles", href: "/roles", icon: Shield },
    { label: "Usuarios", href: "/usuarios", icon: User },
]

const Sidebar: React.FC = () => {
    return (
        <aside className="sidebar">
            {/* ─── Brand / Logo ─── */}
            <div className="sidebar__brand">
                <span className="sidebar__logo">🎬</span>
                <h2 className="sidebar__title">STREAMEASE</h2>
            </div>

            {/* ─── Navegación principal ─── */}
            <nav className="sidebar__nav">
                <ul className="sidebar__menu">
                    {MENU_ITEMS.map((item) => (
                        <NavLink
                            key={item.href}
                            label={item.label}
                            href={item.href}
                            icon={item.icon}
                        />
                    ))}
                </ul>
            </nav>
        </aside>
    )
}

export default Sidebar
