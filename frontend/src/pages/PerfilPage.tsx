import React, { useState } from "react";
import FormInput from "../components/common/FormInput";
import { User, Mail, Shield, Camera, Save, Lock } from "lucide-react";

const PerfilPage: React.FC = () => {
    const [name, setName] = useState("Admin User");
    const [email, setEmail] = useState("admin@streamease.com");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSaveInfo = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Guardando información personal:", { name, email });
    };

    const handleSavePassword = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Cambiando contraseña");
    };

    return (
        <div className="profile-page">
            <div className="profile-grid">
                {/* ─── Columna Izquierda: Foto y Resumen ─── */}
                <div className="profile-card profile-card--center">
                    <div className="profile-avatar-edit">
                        <div className="profile-avatar-large">
                            <span className="profile-avatar-initials">AU</span>
                            <button className="profile-avatar-btn" title="Cambiar foto">
                                <Camera size={18} />
                            </button>
                        </div>
                        <h3>{name}</h3>
                        <p className="profile-role">Administrador del Sistema</p>
                    </div>

                    <div className="profile-stats">
                        <div className="profile-stat-item">
                            <span className="profile-stat-value">124</span>
                            <span className="profile-stat-label">Contratos</span>
                        </div>
                        <div className="profile-divider-v" />
                        <div className="profile-stat-item">
                            <span className="profile-stat-value">Active</span>
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
                                />
                                <FormInput
                                    label="Correo Electrónico"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="correo@ejemplo.com"
                                    required
                                />
                            </div>
                            <div className="profile-form__actions">
                                <button type="submit" className="btn-primary">
                                    <Save size={16} />
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Seguridad / Contraseña */}
                    <div className="profile-card">
                        <div className="profile-card__header">
                            <Lock size={20} className="profile-card__icon" />
                            <h4>Seguridad</h4>
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
                                />
                                <FormInput
                                    label="Confirmar Nueva Contraseña"
                                    name="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repite la nueva contraseña"
                                    required
                                />
                            </div>
                            <div className="profile-form__actions">
                                <button type="submit" className="btn-primary">
                                    <Shield size={16} />
                                    Actualizar Seguridad
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
