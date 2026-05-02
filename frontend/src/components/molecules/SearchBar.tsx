import React, { useState, useRef, useEffect } from "react";
import { Search, User, FileText, Smartphone, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SearchResult {
    id: number;
    title: string;
    subtitle: string;
    type: "cliente" | "contrato" | "cuenta";
    link: string;
}

const MOCK_RESULTS: SearchResult[] = [
    { id: 1, title: "Carlos Mendoza", subtitle: "Cliente - Premium", type: "cliente", link: "/clientes" },
    { id: 2, title: "Contrato #8821", subtitle: "Vence en 2 días", type: "contrato", link: "/contratos" },
    { id: 3, title: "netflix_premium@mail.com", subtitle: "Cuenta - Activa", type: "cuenta", link: "/cuentas" },
    { id: 4, title: "Ana Torres", subtitle: "Cliente - Nuevo", type: "cliente", link: "/clientes" },
];

const SearchBar: React.FC = () => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (query.length > 1) {
            const filtered = MOCK_RESULTS.filter(res => 
                res.title.toLowerCase().includes(query.toLowerCase()) ||
                res.subtitle.toLowerCase().includes(query.toLowerCase())
            );
            setResults(filtered);
            setIsOpen(true);
        } else {
            setResults([]);
            setIsOpen(false);
        }
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (link: string) => {
        navigate(link);
        setIsOpen(false);
        setQuery("");
    };

    const getIcon = (type: SearchResult["type"]) => {
        switch (type) {
            case "cliente": return <User size={14} />;
            case "contrato": return <FileText size={14} />;
            case "cuenta": return <Smartphone size={14} />;
        }
    };

    return (
        <div className="search-container" ref={containerRef}>
            <div className={`search-bar ${isOpen ? "search-bar--active" : ""}`}>
                <Search className="search-bar__icon" size={18} />
                <input
                    type="text"
                    className="search-bar__input"
                    placeholder="Buscar cliente, contrato o cuenta..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length > 1 && setIsOpen(true)}
                />
                {query && (
                    <button className="search-bar__clear" onClick={() => setQuery("")}>
                        <X size={14} />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="search-results">
                    {results.length > 0 ? (
                        <div className="search-results__list">
                            <div className="search-results__label">Resultados Sugeridos</div>
                            {results.map(res => (
                                <button 
                                    key={`${res.type}-${res.id}`} 
                                    className="search-results__item"
                                    onClick={() => handleSelect(res.link)}
                                >
                                    <div className={`search-results__icon search-results__icon--${res.type}`}>
                                        {getIcon(res.type)}
                                    </div>
                                    <div className="search-results__info">
                                        <span className="search-results__title">{res.title}</span>
                                        <span className="search-results__subtitle">{res.subtitle}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="search-results__empty">
                            No se encontraron resultados para "{query}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;

