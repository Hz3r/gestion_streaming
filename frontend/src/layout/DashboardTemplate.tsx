import React from "react";
import Sidebar from "../components/organism/Sidebar";
import Header from "../components/organism/Header";
import { useLocation, Outlet } from "react-router-dom";



const PAGE_TITLES: Record<string, string> = {
    "/": "Dashboard",
    "/cuentas": "Cuentas",
    "/plataformas": "Plataformas",
    "/metodo_pago": "Metodo de Pago",
    "/proveedores": "Proveedores",
    "/clientes": "Clientes",
    "/contratos": "Contratos",
    "/roles": "Roles",
    "/usuarios": "Usuarios",
    "/configuracion": "Configuración",
}

const DashboardTemplate: React.FC = () => {
    const location = useLocation();
    const title = PAGE_TITLES[location.pathname] || "Página no Encontrada";

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="dashboard__content ">
                <Header title={title} />
                <div className="result_dashboard">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default DashboardTemplate;
