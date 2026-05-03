import React, { useState, useRef, useEffect } from "react";
import { Search, User, FileText, Smartphone, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchGlobal } from "../../services/searchService";

interface SearchResult {
    id: number;
    title: string;
    subtitle: string;
    type: "cliente" | "contrato" | "cuenta";
    link: string;
}

const SearchBar: React.FC = () => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (query.trim().length > 1) {
            setIsLoading(true);
            debounceRef.current = setTimeout(async () => {
                try {
                    const res = await searchGlobal(query);
                    setResults(res.data || []);
                    setIsOpen(true);
                } catch (error) {
                    console.error("Error en búsqueda:", error);
                    setResults([]);
                } finally {
                    setIsLoading(false);
                }
            }, 400); // 400ms debounce
        } else {
            setResults([]);
            setIsOpen(false);
            setIsLoading(false);
        }

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
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
                {isLoading ? (
                    <Loader2 className="search-bar__icon animate-spin" size={18} />
                ) : (
                    <Search className="search-bar__icon" size={18} />
                )}
                <input
                    type="text"
                    className="search-bar__input"
                    placeholder="Buscar cliente, contrato o cuenta..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length > 1 && setIsOpen(true)}
                />
                {query && (
                    <button className="search-bar__clear" onClick={() => { setQuery(""); setResults([]); }}>
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

