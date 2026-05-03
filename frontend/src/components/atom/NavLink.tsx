import React from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

interface NavLinkProps {
    label: string,
    href: string,
    icon?: LucideIcon
}

const NavLink: React.FC<NavLinkProps> = ({ label, href, icon: Icon }: NavLinkProps) => {
    return (
        <RouterNavLink 
            to={href} 
            className={({ isActive }) => `navlink ${isActive ? "navlink--active" : ""}`}
        >
            {Icon && <span className="navlink__icon"><Icon size={20} /></span>}
            {label && <span className="navlink__label">{label}</span>}
        </RouterNavLink>
    )
}

export default NavLink