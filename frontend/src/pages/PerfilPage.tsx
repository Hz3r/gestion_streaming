import React, { useState, useEffect, useRef } from "react";
import FormInput from "../components/common/FormInput";
import { User, Shield, Save, Lock, CheckCircle, AlertCircle, Camera, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updatePerfil, updatePassword, getUserStats } from "../services/dashboardService";

const PerfilPage: React.FC = () => {
    const { user, updateUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [name, setName] = useState(user?.nombre || "");
    const [email, setEmail] = useState(user?.email || "");
    const [foto, setFoto] = useState(user?.foto || "");
    const [stats, setStats] = useState({ total_contratos: 0 });
    
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    useEffect(() => {
        if (user) {
            setName(user.nombre);
            setEmail(user.email);
            setFoto(user.foto || "");
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        if (!user) return;
        try {
            const res = await getUserStats(user.id);
            setStats(res.data);
        } catch (error) {
            console.error("Error al cargar estadísticas:", error);
        }
    };

    const showMessage = (text: string, type: "success" | "error") => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: "", type: "" }), 5000);
    };

    const handleSaveInfo = async (e?: React.FormEvent, newFoto?: string) => {
        if (e) e.preventDefault();
        if (!user) return;
        setLoading(true);
        try {
            const fotoToSave = newFoto !== undefined ? newFoto : foto;
            await updatePerfil(user.id, { nombre: name, email, foto_perfil: fotoToSave });
            updateUser({ nombre: name, email, foto: fotoToSave });
            showMessage("Perfil actualizado correctamente", "success");
        } catch (error: any) {
            showMessage(error.response?.data?.message || "Error al actualizar el perfil", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                return showMessage("La imagen es demasiado pesada (Máx 2MB)", "error");
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFoto(base64String);
                handleSaveInfo(undefined, base64String); 
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = async () => {
        setFoto("");
        await handleSaveInfo(undefined, "");
        showMessage("Foto eliminada correctamente", "success");
    };

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        if (newPassword !== confirmPassword) {
            return showMessage("Las contraseñas no coinciden", "error");
        }

        setLoading(true);
        try {
            await updatePassword(user.id, { 
                passwordActual: password, 
                passwordNueva: newPassword 
            });
            showMessage("Contraseña actualizada con éxito", "success");
            setPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            showMessage(error.response?.data?.message || "Error al cambiar la contraseña", "error");
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (n: string) => {
        return n.split(" ").map(i => i[0]).join("").toUpperCase().substring(0, 2);
    };

    return (
        <div className="profile-page">
            {message.text && (
                <div className={`alert-toast alert-toast--${message.type}`}>
                    {message.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span>{message.text}</span>
                </div>
            )}

            <div className="profile-grid">
                {/* ─── Columna Izquierda: Foto y Resumen ─── */}
                <div className="profile-card profile-card--center">
                    <div className="profile-avatar-edit">
                        <div className="profile-avatar-large">
                            {foto ? (
                                <img src={foto} alt="Avatar" className="profile-avatar-img" />
                            ) : (
                                <span className="profile-avatar-initials">{getInitials(name || "U")}</span>
                            )}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <button 
                                className="profile-avatar-btn" 
                                title="Cambiar foto"
                                 onClick={() => fileInputRef.current?.click()}
                                disabled={loading}
                            >
                                <Camera size={18} />
                            </button>
                            {foto && (
                                <button 
                                    className="profile-avatar-remove" 
                                    title="Quitar foto"
                                     onClick={handleRemovePhoto}
                                    disabled={loading}
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                        <h3>{name}</h3>
                        <p className="profile-role">
                            {user?.rol === 1 ? "Administrador" : "Vendedor / Operador"}
                        </p>
                    </div>

                    <div className="profile-stats">
                        <div className="profile-stat-item">
                            <span className="profile-stat-value">{stats.total_contratos}</span>
                            <span className="profile-stat-label">Contratos</span>
                        </div>
                        <div className="profile-divider-v" />
                        <div className="profile-stat-item">
                            <span className="profile-stat-value">Activo</span>
                            <span className="profile-stat-label">Estado</span>
                        </div>
                    </div>
                </div>

                {/* ─── Columna Derecha: Formularios ─── */}
                <div className="profile-forms-container">
                    {/* Información Personal */}
                    <div className="profile-card">
                        <div className="profile-card__header">
                            <User size={20} className="profile-card__icon" />
                            <h4>Información Personal</h4>
                        </div>
                        <form onSubmit={handleSaveInfo} className="profile-form">
                            <div className="form-grid">
                                <FormInput
                                    label="Nombre Completo"
                                    name="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Tu nombre"
                                    required
                                    disabled={loading}
                                />
                                <FormInput
                                    label="Correo Electrónico"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="correo@ejemplo.com"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="profile-form__actions">
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    <Save size={16} />
                                    {loading ? "Guardando..." : "Guardar Cambios"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Seguridad / Contraseña */}
                    <div className="profile-card">
                        <div className="profile-card__header">
                            <Lock size={20} className="profile-card__icon" />
                            <h4>Seguridad y Contraseña</h4>
                        </div>
                        <form onSubmit={handleSavePassword} className="profile-form">
                            <div className="form-grid">
                                <FormInput
                                    label="Contraseña Actual"
                                    name="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="********"
                                    required
                                    disabled={loading}
                                />
                                <div className="form-field--empty" />
                                <FormInput
                                    label="Nueva Contraseña"
                                    name="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Mínimo 8 caracteres"
                                    required
                                    disabled={loading}
                                />
                                <FormInput
                                    label="Confirmar Nueva Contraseña"
                                    name="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repite la nueva contraseña"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="profile-form__actions">
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    <Shield size={16} />
                                    {loading ? "Actualizando..." : "Actualizar Seguridad"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerfilPage;
