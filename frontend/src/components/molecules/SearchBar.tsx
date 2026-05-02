import React from "react";
import { Search } from "lucide-react";

const SearchBar: React.FC = () => {
    return (
        <div className="search-bar">
            <Search className="search-bar__icon" size={18} />
            <input
                type="text"
                className="search-bar__input"
                placeholder="Buscar..."
                id="header-search"
            />
        </div>
    );
};

export default SearchBar;
