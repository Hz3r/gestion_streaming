import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

interface UserProfileProps {
    name?: string;
    role?: string;
    avatarUrl?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({
    name = "Admin User",
    role = "Administrador",
    avatarUrl,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="user-profile-container" ref={dropdownRef}>
            <button 
                className={`user-profile ${isOpen ? "user-profile--active" : ""}`} 
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Perfil de usuario"
                aria-expanded={isOpen}
            >
                <div className="user-profile__avatar">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={name} className="user-profile__avatar-img" />
                    ) : (
                        <span className="user-profile__avatar-initials">{initials}</span>
                    )}
                    <span className="user-profile__status" />
                </div>
                <div className="user-profile__info">
                    <span className="user-profile__name">{name}</span>
                    <span className="user-profile__role">{role}</span>
                </div>
                <ChevronDown size={16} className={`user-profile__chevron ${isOpen ? "user-profile__chevron--open" : ""}`} />
            </button>

            {isOpen && (
                <div className="user-profile-dropdown">
                    <ul className="user-profile-dropdown__menu">
                        <li>
                            <Link to="/perfil" className="user-profile-dropdown__item" onClick={() => setIsOpen(false)}>
                                <User size={16} />
                                <span>Ver Perfil</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/configuracion" className="user-profile-dropdown__item" onClick={() => setIsOpen(false)}>
                                <Settings size={16} />
                                <span>Configuración</span>
                            </Link>
                        </li>
                        <li className="user-profile-dropdown__divider" />
                        <li>
                            <button className="user-profile-dropdown__item user-profile-dropdown__item--danger" onClick={() => console.log("Logout")}>
                                <LogOut size={16} />
                                <span>Cerrar Sesión</span>
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UserProfile;

