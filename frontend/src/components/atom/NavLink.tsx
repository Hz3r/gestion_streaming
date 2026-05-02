import React from "react";
import type { LucideIcon } from "lucide-react";

interface NavLinkProps {
    label: string,
    href: string,
    icon?: LucideIcon,
    isActive?: boolean
}


const NavLink: React.FC<NavLinkProps> = ({ label, href, icon: Icon, isActive }: NavLinkProps) => {
    return (
        <li className={`navlink ${isActive ? "navlink--active" : ""}`}>
            {Icon && <span className="navlink__icon"><Icon size={20} /></span>}
            <a className="navlink__label" href={href}>{label}</a>
        </li>
    )
}

export default NavLink