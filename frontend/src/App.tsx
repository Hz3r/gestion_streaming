import { Routes, Route } from "react-router-dom";
import DashboardTemplate from "./layout/DashboardTemplate";

import DashboardPage from "./pages/DasboardPage";
import CuentasPage from "./pages/CuentasPage";
import PlataformasPage from "./pages/PlataformasPage";
import MetodoPagoPage from "./pages/Metodo_PagoPage";
import ProveedoresPage from "./pages/ProveedoresPage";
import ClientesPage from "./pages/ClientesPage";
import ContratosPage from "./pages/ContratosPage";
import FinanzasPage from "./pages/FinanzasPage";
import RolesPage from "./pages/RolesPage";
import UsuariosPage from "./pages/UsuariosPage";
import ConfiguracionPage from "./pages/ConfiguracionPage";
import PerfilPage from "./pages/PerfilPage";

function App() {
  return (
    <Routes>
      <Route element={<DashboardTemplate />} >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/cuentas" element={<CuentasPage />} />
        <Route path="/plataformas" element={<PlataformasPage />} />
        <Route path="/metodo_pago" element={<MetodoPagoPage />} />
        <Route path="/proveedores" element={<ProveedoresPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/contratos" element={<ContratosPage />} />
        <Route path="/finanzas" element={<FinanzasPage />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/usuarios" element={<UsuariosPage />} />
        <Route path="/configuracion" element={<ConfiguracionPage />} />
        <Route path="/perfil" element={<PerfilPage />} />
      </Route>
    </Routes>
  );
}

export default App;
