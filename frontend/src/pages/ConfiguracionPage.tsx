import React, { useState } from "react";
import FormInput from "../components/common/FormInput";
import FormSelect from "../components/common/FormSelect";
import { Settings, Layout, Globe, Bell, Save, Image as ImageIcon } from "lucide-react";

const ConfiguracionPage: React.FC = () => {
    const [siteTitle, setSiteTitle] = useState("StreamEase");
    const [language, setLanguage] = useState("es");
    const [theme, setTheme] = useState("light");
    const [notifications, setNotifications] = useState("all");

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Guardando configuración del sistema:", { siteTitle, language, theme });
    };

    return (
        <div className="settings-page">
            <div className="settings-grid">
                {/* ─── Sección: Apariencia del Sistema ─── */}
                <div className="profile-card">
                    <div className="profile-card__header">
                        <Layout size={20} className="profile-card__icon" />
                        <h4>Apariencia del Sistema</h4>
                    </div>
                    <form onSubmit={handleSaveSettings} className="profile-form">
                        <div className="form-grid">
                            <FormInput
                                label="Título del Sitio"
                                name="siteTitle"
                                value={siteTitle}
                                onChange={(e) => setSiteTitle(e.target.value)}
                                placeholder="Nombre de tu negocio"
                                required
                            />
                            <FormSelect
                                label="Tema Visual"
                                name="theme"
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                options={[
                                    { value: "light", label: "Claro (BankDash)" },
                                    { value: "dark", label: "Oscuro (Premium)" },
                                    { value: "system", label: "Seguir Sistema" }
                                ]}
                            />
                        </div>
                        
                        <div className="settings-logo-upload">
                            <label className="form-field__label">Logotipo / Icono del Sistema</label>
                            <div className="logo-preview-container">
                                <div className="logo-preview">
                                    <ImageIcon size={32} className="logo-preview-icon" />
                                </div>
                                <div className="logo-upload-info">
                                    <p>Sube un archivo PNG o SVG (máx. 2MB)</p>
                                    <button type="button" className="btn-secondary btn-sm">Seleccionar Archivo</button>
                                </div>
                            </div>
                        </div>

                        <div className="profile-form__actions">
                            <button type="submit" className="btn-primary">
                                <Save size={16} />
                                Guardar Configuración
                            </button>
                        </div>
                    </form>
                </div>

                {/* ─── Sección: Regional y Preferencias ─── */}
                <div className="profile-card">
                    <div className="profile-card__header">
                        <Globe size={20} className="profile-card__icon" />
                        <h4>Preferencias Regionales</h4>
                    </div>
                    <form className="profile-form">
                        <div className="form-grid">
                            <FormSelect
                                label="Idioma del Panel"
                                name="language"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                options={[
                                    { value: "es", label: "Español" },
                                    { value: "en", label: "English" },
                                    { value: "pt", label: "Português" }
                                ]}
                            />
                            <FormSelect
                                label="Zona Horaria"
                                name="timezone"
                                value="America/Lima"
                                onChange={() => {}}
                                options={[
                                    { value: "America/Lima", label: "(GMT-05:00) Lima, Bogotá" },
                                    { value: "America/Mexico_City", label: "(GMT-06:00) CDMX" },
                                    { value: "America/Santiago", label: "(GMT-04:00) Santiago" }
                                ]}
                            />
                        </div>
                    </form>
                </div>

                {/* ─── Sección: Notificaciones ─── */}
                <div className="profile-card">
                    <div className="profile-card__header">
                        <Bell size={20} className="profile-card__icon" />
                        <h4>Alertas y Notificaciones</h4>
                    </div>
                    <form className="profile-form">
                        <div className="form-grid">
                            <FormSelect
                                label="Notificaciones de Contratos"
                                name="notifications"
                                value={notifications}
                                onChange={(e) => setNotifications(e.target.value)}
                                options={[
                                    { value: "all", label: "Todas las alertas" },
                                    { value: "vencimiento", label: "Solo próximos vencimientos" },
                                    { value: "none", label: "Desactivar" }
                                ]}
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ConfiguracionPage;