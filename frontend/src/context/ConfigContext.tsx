import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getConfiguracion } from '../services/configuracionService';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

interface Config {
    titulo_sitio: string;
    subtitulo_sitio: string;
    tema_visual: string;
    idioma: string;
    logo_url: string;
    notificaciones: string;
    zona_horaria: string;
}

const translations: any = {
    es: {
        dashboard: "Dashboard",
        cuentas: "Cuentas",
        plataformas: "Plataformas",
        metodo_pago: "Métodos de Pago",
        proveedores: "Proveedores",
        clientes: "Clientes",
        contratos: "Contratos",
        finanzas: "Finanzas",
        configuracion: "Configuración",
        usuarios: "Usuarios",
        perfil: "Mi Perfil",
        lank_farm: "Lank Farm",
        cuentas_rotativas: "Cuentas Rotativas",
        logout: "Cerrar Sesión",
        save_changes: "Guardar Cambios",
        settings: "Ajustes del Sistema",
        principal: "Principal",
        gestion: "Gestión",
        infraestructura: "Infraestructura",
        sistema: "Sistema"
    },
    en: {
        dashboard: "Dashboard",
        cuentas: "Accounts",
        plataformas: "Platforms",
        metodo_pago: "Payment Methods",
        proveedores: "Suppliers",
        clientes: "Customers",
        contratos: "Contracts",
        finanzas: "Finances",
        configuracion: "Settings",
        usuarios: "Users",
        perfil: "My Profile",
        lank_farm: "Lank Farm",
        cuentas_rotativas: "Rotative Accounts",
        logout: "Logout",
        save_changes: "Save Changes",
        settings: "System Settings",
        principal: "Main",
        gestion: "Management",
        infraestructura: "Infrastructure",
        sistema: "System"
    }
};

interface ConfigContextType {
    config: Config;
    refreshConfig: () => Promise<void>;
    isLoading: boolean;
    t: (key: string) => string;
}

const ConfigContext = createContext<ConfigContextType>({} as ConfigContextType);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<Config>({
        titulo_sitio: 'Lank Farm',
        subtitulo_sitio: 'Management System',
        tema_visual: 'light',
        idioma: 'es',
        logo_url: '',
        notificaciones: 'all',
        zona_horaria: 'America/Lima'
    });
    const [isLoading, setIsLoading] = useState(true);

    const t = (key: string) => {
        const lang = config.idioma || 'es';
        return translations[lang]?.[key] || key;
    };

    const refreshConfig = async () => {
        try {
            const res = await getConfiguracion();
            if (res.data) {
                setConfig(res.data);
                applyTheme(res.data.tema_visual);
            }
        } catch (error) {
            console.error("Error al cargar configuración global:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const applyTheme = (theme: string) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark-theme');
        } else {
            document.documentElement.classList.remove('dark-theme');
        }
    };

    useEffect(() => {
        refreshConfig();
    }, []);

    // Escuchar cambios de tema en tiempo real si es necesario
    useEffect(() => {
        applyTheme(config.tema_visual);
    }, [config.tema_visual]);

    const muiTheme = useMemo(() => 
        createTheme({
            palette: {
                mode: config.tema_visual === 'dark' ? 'dark' : 'light',
                primary: {
                    main: '#4c6ef5',
                },
                background: {
                    default: config.tema_visual === 'dark' ? '#0b1437' : '#f4f7fe',
                    paper: config.tema_visual === 'dark' ? '#111c44' : '#ffffff',
                },
                text: {
                    primary: config.tema_visual === 'dark' ? '#ffffff' : '#2b3674',
                }
            },
            typography: {
                fontFamily: 'Inter, sans-serif',
            },
            components: {
                MuiPaper: {
                    styleOverrides: {
                        root: {
                            backgroundImage: 'none',
                        }
                    }
                }
            }
        }), [config.tema_visual]
    );

    return (
        <ConfigContext.Provider value={{ config, refreshConfig, isLoading, t }}>
            <ThemeProvider theme={muiTheme}>
                {children}
            </ThemeProvider>
        </ConfigContext.Provider>
    );
};

export const useConfig = () => useContext(ConfigContext);
