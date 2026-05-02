import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, X } from "lucide-react";

interface ComboboxOption {
  value: string | number;
  label: string;
  sublabel?: string;     // Texto secundario (ej: plataforma, disponibilidad)
  group?: string;        // Para agrupar opciones (ej: por plataforma)
  disabled?: boolean;    // Deshabilitar opción (ej: sin stock)
}

interface FormComboboxProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (name: string, value: string | number) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  emptyMessage?: string;
  grouped?: boolean;     // Mostrar opciones agrupadas por group
}

const FormCombobox: React.FC<FormComboboxProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  required = false,
  disabled = false,
  error,
  emptyMessage = "No se encontraron resultados",
  grouped = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ─── Opción seleccionada actual ───
  const selectedOption = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  // ─── Filtrar opciones por búsqueda ───
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.sublabel && o.sublabel.toLowerCase().includes(q)) ||
        (o.group && o.group.toLowerCase().includes(q))
    );
  }, [options, search]);

  // ─── Agrupar opciones si grouped=true ───
  const groupedOptions = useMemo(() => {
    if (!grouped) return null;
    const groups: Record<string, ComboboxOption[]> = {};
    filteredOptions.forEach((o) => {
      const g = o.group || "Otros";
      if (!groups[g]) groups[g] = [];
      groups[g].push(o);
    });
    return groups;
  }, [filteredOptions, grouped]);

  // ─── Cerrar al hacer clic fuera ───
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Focus en input de búsqueda al abrir ───
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (opt: ComboboxOption) => {
    if (opt.disabled) return;
    onChange(name, opt.value);
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(name, "");
    setSearch("");
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) setSearch("");
  };

  // ─── Keyboard navigation ───
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearch("");
    }
  };

  const renderOption = (opt: ComboboxOption) => (
    <li
      key={opt.value}
      className={`combobox-option ${opt.value === value ? "combobox-option--selected" : ""} ${opt.disabled ? "combobox-option--disabled" : ""}`}
      onClick={() => handleSelect(opt)}
    >
      <div className="combobox-option__content">
        <span className="combobox-option__label">{opt.label}</span>
        {opt.sublabel && (
          <span className="combobox-option__sublabel">{opt.sublabel}</span>
        )}
      </div>
      {opt.value === value && (
        <span className="combobox-option__check">✓</span>
      )}
    </li>
  );

  return (
    <div
      ref={containerRef}
      className={`form-field ${error ? "form-field--error" : ""}`}
      onKeyDown={handleKeyDown}
    >
      <label className="form-field__label" htmlFor={name}>
        {label}
        {required && <span className="form-field__required">*</span>}
      </label>

      {/* ─── Trigger ─── */}
      <div
        className={`combobox-trigger ${isOpen ? "combobox-trigger--open" : ""} ${disabled ? "combobox-trigger--disabled" : ""}`}
        onClick={handleToggle}
      >
        <span className={`combobox-trigger__text ${!selectedOption ? "combobox-trigger__placeholder" : ""}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="combobox-trigger__actions">
          {value && !disabled && (
            <button className="combobox-trigger__clear" onClick={handleClear} type="button">
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={16}
            className={`combobox-trigger__arrow ${isOpen ? "combobox-trigger__arrow--open" : ""}`}
          />
        </div>
      </div>

      {/* ─── Dropdown ─── */}
      {isOpen && (
        <div className="combobox-dropdown">
          {/* Search */}
          <div className="combobox-search">
            <Search size={14} className="combobox-search__icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="combobox-search__input"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {search && (
              <span className="combobox-search__count">
                {filteredOptions.length}
              </span>
            )}
          </div>

          {/* Options list */}
          <ul className="combobox-list">
            {filteredOptions.length === 0 ? (
              <li className="combobox-empty">{emptyMessage}</li>
            ) : grouped && groupedOptions ? (
              Object.entries(groupedOptions).map(([groupName, opts]) => (
                <li key={groupName} className="combobox-group">
                  <span className="combobox-group__label">{groupName}</span>
                  <ul>{opts.map(renderOption)}</ul>
                </li>
              ))
            ) : (
              filteredOptions.map(renderOption)
            )}
          </ul>
        </div>
      )}

      {error && <span className="form-field__error">{error}</span>}
    </div>
  );
};

export default FormCombobox;
