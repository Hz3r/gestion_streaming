import React from "react"
import SearchBar from "../molecules/SearchBar"
import NotificationBell from "../molecules/NotificationBell"
import UserProfile from "../molecules/UserProfile"

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    return (
        <header className="header">
            <h4>{title}</h4>

            <div className="header__actions">
                <SearchBar />
                <div className="header__toolbar">
                    <NotificationBell />
                    <div className="header__divider" />
                    <UserProfile />
                </div>
            </div>
        </header>
    )
}

export default Header
