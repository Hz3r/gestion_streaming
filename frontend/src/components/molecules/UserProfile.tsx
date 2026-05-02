import React from "react";
import { ChevronDown } from "lucide-react";

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
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <button className="user-profile" id="header-user-profile" aria-label="Perfil de usuario">
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
            <ChevronDown size={16} className="user-profile__chevron" />
        </button>
    );
};

export default UserProfile;
