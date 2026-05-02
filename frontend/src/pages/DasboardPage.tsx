import { useState, useEffect } from "react";
import { Users, FileText, Smartphone, TrendingUp } from "lucide-react";
import { getClientes, getContratos, getCuentas, getResumenGeneral } from "../services/dashboardService";

const DashboardPage = () => {
  const [stats, setStats] = useState({
    clientes: 0,
    contratos: 0,
    cuentas: 0,
    ingresos: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resCli, resCon, resCue, resFin] = await Promise.all([
          getClientes(),
          getContratos(),
          getCuentas(),
          getResumenGeneral()
        ]);
        
        const mesActual = new Date().getMonth() + 1;
        const anioActual = new Date().getFullYear();
        const finanzasActual = resFin.data.find((f: any) => f.mes === mesActual && f.anio === anioActual);

        setStats({
          clientes: resCli.data.length,
          contratos: resCon.data.length,
          cuentas: resCue.data.length,
          ingresos: finanzasActual ? Number(finanzasActual.ingresos_reales) : 0
        });
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Clientes Activos", value: stats.clientes, icon: <Users size={24} />, color: "var(--color-primary-500)", bg: "var(--color-primary-50)" },
    { label: "Contratos Vigentes", value: stats.contratos, icon: <FileText size={24} />, color: "var(--color-success-500)", bg: "var(--color-success-50)" },
    { label: "Cuentas en Stock", value: stats.cuentas, icon: <Smartphone size={24} />, color: "var(--color-info-500)", bg: "var(--color-info-50)" },
    { label: "Ingresos del Mes", value: `S/ ${stats.ingresos.toFixed(2)}`, icon: <TrendingUp size={24} />, color: "var(--color-warning-500)", bg: "var(--color-warning-50)" },
  ];

  if (loading) return <div className="loading-state">Cargando tablero...</div>;

  return (
    <div className="dashboard-summary">
      <div className="dashboard-grid">
        {cards.map((card, i) => (
          <div key={i} className="dashboard-card">
            <div className="dashboard-card__icon" style={{ color: card.color, backgroundColor: card.bg }}>
              {card.icon}
            </div>
            <div className="dashboard-card__info">
              <span className="dashboard-card__label">{card.label}</span>
              <span className="dashboard-card__value">{card.value}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Puedes agregar más secciones aquí como gráficos rápidos o alertas recientes */}
      <div className="dashboard-welcome">
        <h2>¡Bienvenido de nuevo!</h2>
        <p>Aquí tienes un resumen de lo que está sucediendo en tu negocio de streaming hoy.</p>
      </div>
    </div>
  );
};

export default DashboardPage;