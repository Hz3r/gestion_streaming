import React, { useState, useEffect, useRef } from "react";
import FormInput from "../components/common/FormInput";
import FormSelect from "../components/common/FormSelect";
import { Settings, Layout, Globe, Bell, Save, Image as ImageIcon, CheckCircle, AlertCircle, Trash2, Upload } from "lucide-react";
import { getConfiguracion, updateConfiguracion } from "../services/configuracionService";
import { useConfig } from "../context/ConfigContext";
import { useToast } from "../context/ToastContext";

const ConfiguracionPage: React.FC = () => {
    const { refreshConfig } = useConfig();
    const { showToast } = useToast();
    const [siteTitle, setSiteTitle] = useState("");
    const [siteSubtitle, setSiteSubtitle] = useState("");
    const [language, setLanguage] = useState("es");
    const [theme, setTheme] = useState("light");
    const [notifications, setNotifications] = useState("all");
    const [timezone, setTimezone] = useState("America/Lima");
    const [logo, setLogo] = useState("");
    
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await getConfiguracion();
            const data = res.data;
            if (data) {
                setSiteTitle(data.titulo_sitio || "StreamEase");
                setSiteSubtitle(data.subtitulo_sitio || "Management System");
                setLanguage(data.idioma || "es");
                setTheme(data.tema_visual || "light");
                setNotifications(data.notificaciones || "all");
                setTimezone(data.zona_horaria || "America/Lima");
                setLogo(data.logo_url || "");
            }
        } catch (error) {
            console.error("Error al cargar configuración:", error);
        }
    };

    const handleSaveSettings = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            await updateConfiguracion({
                titulo_sitio: siteTitle,
                subtitulo_sitio: siteSubtitle,
                tema_visual: theme,
                idioma: language,
                notificaciones: notifications,
                zona_horaria: timezone,
                logo_url: logo
            });
            await refreshConfig();
            showToast("Configuración del sistema actualizada", "success");
        } catch (error) {
            showToast("Error al guardar la configuración", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                return showToast("El logo es demasiado pesado (Máx 2MB)", "error");
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setLogo(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="settings-page">
            <form onSubmit={handleSaveSettings} className="settings-global-form">
                <div className="settings-grid">
                    {/* ─── Sección: Apariencia del Sistema ─── */}
                    <div className="profile-card">
                        <div className="profile-card__header">
                            <Layout size={20} className="profile-card__icon" />
                            <h4>Apariencia del Sistema</h4>
                        </div>
                        <div className="profile-form">
                            <div className="form-grid">
                                <FormInput
                                    label="Título del Sitio"
                                    name="siteTitle"
                                    value={siteTitle}
                                    onChange={(e) => setSiteTitle(e.target.value)}
                                    placeholder="Nombre de tu negocio"
                                    required
                                    disabled={loading}
                                />
                                <FormInput
                                    label="Subtítulo del Sitio"
                                    name="siteSubtitle"
                                    value={siteSubtitle}
                                    onChange={(e) => setSiteSubtitle(e.target.value)}
                                    placeholder="Ej: Management System"
                                    disabled={loading}
                                />
                                <FormSelect
                                    label="Tema Visual"
                                    name="theme"
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    options={[
                                        { value: "light", label: "Claro (BankDash)" },
                                        { value: "dark", label: "Oscuro (Premium)" }
                                    ]}
                                    disabled={loading}
                                />
                            </div>
                            
                            <div className="settings-logo-upload">
                                <label className="form-field__label">Logotipo del Sistema</label>
                                <div className="logo-preview-container">
                                    <div className="logo-preview">
                                        {logo ? (
                                            <img src={logo} alt="Logo" className="logo-preview-img" />
                                        ) : (
                                            <ImageIcon size={32} className="logo-preview-icon" />
                                        )}
                                    </div>
                                    <div className="logo-upload-info">
                                        <p>Sube un archivo PNG o SVG (máx. 2MB)</p>
                                        <div className="logo-upload-actions">
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                style={{ display: 'none' }} 
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                            />
                                            <button 
                                                type="button" 
                                                className="btn-secondary btn-sm"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={loading}
                                            >
                                                <Upload size={14} /> Seleccionar
                                            </button>
                                            {logo && (
                                                <button 
                                                    type="button" 
                                                    className="btn-danger-outline btn-sm"
                                                    onClick={() => setLogo("")}
                                                    disabled={loading}
                                                >
                                                    <Trash2 size={14} /> Quitar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── Sección: Regional y Preferencias ─── */}
                    <div className="profile-card">
                        <div className="profile-card__header">
                            <Globe size={20} className="profile-card__icon" />
                            <h4>Preferencias Regionales</h4>
                        </div>
                        <div className="profile-form">
                            <div className="form-grid">
                                <FormSelect
                                    label="Idioma del Panel"
                                    name="language"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    options={[
                                        { value: "es", label: "Español" },
                                        { value: "en", label: "English" }
                                    ]}
                                    disabled={loading}
                                />
                                <FormSelect
                                    label="Zona Horaria"
                                    name="timezone"
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    options={[
                                        { value: "America/Lima", label: "(GMT-05:00) Lima, Bogotá" },
                                        { value: "America/Mexico_City", label: "(GMT-06:00) CDMX" },
                                        { value: "America/Santiago", label: "(GMT-04:00) Santiago" }
                                    ]}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ─── Sección: Notificaciones ─── */}
                    <div className="profile-card">
                        <div className="profile-card__header">
                            <Bell size={20} className="profile-card__icon" />
                            <h4>Alertas y Notificaciones</h4>
                        </div>
                        <div className="profile-form">
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
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTÓN DE GUARDADO GLOBAL */}
                <div className="settings-footer-actions">
                    <button type="submit" className="btn-primary btn-lg" disabled={loading}>
                        <Save size={20} />
                        {loading ? "Guardando cambios en el sistema..." : "Guardar Toda la Configuración"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ConfiguracionPage;