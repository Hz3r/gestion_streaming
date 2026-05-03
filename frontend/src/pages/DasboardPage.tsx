import { useState, useEffect, useMemo } from "react";
import { 
  Users, FileText, Smartphone, TrendingUp, AlertCircle, 
  Calendar, ArrowUpRight, ArrowDownRight, DollarSign,
  PieChart as PieChartIcon, Activity
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from "recharts";
import { 
  getClientes, getContratos, getCuentas, getResumenGeneral 
} from "../services/dashboardService";
import { formatFullDate } from "../utils/dateUtils";
import { differenceInDays, parseISO } from "date-fns";
import "../styles/dashboard.css";

const COLORS = ["#4c6ef5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    clientes: [],
    contratos: [],
    cuentas: [],
    finanzas: []
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [resCli, resCon, resCue, resFin] = await Promise.all([
          getClientes(),
          getContratos(),
          getCuentas(),
          getResumenGeneral()
        ]);
        
        setData({
          clientes: resCli.data,
          contratos: resCon.data,
          cuentas: resCue.data,
          finanzas: resFin.data
        });
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // ─── Cálculos de Métricas ───
  const stats = useMemo(() => {
    const today = new Date();
    
    const capacidadOcupada = data.cuentas.reduce((acc: number, c: any) => acc + (c.perfiles_en_uso || 0), 0);
    const capacidadTotal = data.cuentas.reduce((acc: number, c: any) => acc + (c.capacidad_total || 0), 0);
    
    // Contar alertas críticas (< 3 días)
    const urgentes = [
      ...data.cuentas.filter((c: any) => c.fecha_expiracion && differenceInDays(parseISO(c.fecha_expiracion), today) <= 3 && differenceInDays(parseISO(c.fecha_expiracion), today) >= 0),
      ...data.contratos.filter((con: any) => con.fecha_proximo_pago && differenceInDays(parseISO(con.fecha_proximo_pago), today) <= 3 && differenceInDays(parseISO(con.fecha_proximo_pago), today) >= 0)
    ].length;

    return {
      totalClientes: data.clientes.length,
      totalContratos: data.contratos.length,
      totalCuentas: data.cuentas.length,
      perfilesLibres: capacidadTotal - capacidadOcupada,
      urgentes,
      capacidadOcupada,
      capacidadTotal
    };
  }, [data]);

  // ─── Data para Gráfico de Barras (Stock por Plataforma) ───
  const stockData = useMemo(() => {
    const platforms: Record<string, { ocupados: number, libres: number }> = {};
    data.cuentas.forEach((c: any) => {
      if (!platforms[c.plataforma]) platforms[c.plataforma] = { ocupados: 0, libres: 0 };
      platforms[c.plataforma].ocupados += (c.perfiles_en_uso || 0);
      platforms[c.plataforma].libres += (c.capacidad_total - (c.perfiles_en_uso || 0));
    });
    return Object.entries(platforms).map(([name, val]) => ({ name, ...val }));
  }, [data.cuentas]);

  // ─── Data para Gráfico de Tarta (Plataformas) ───
  const platformData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.cuentas.forEach((c: any) => {
      counts[c.plataforma] = (counts[c.plataforma] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data.cuentas]);

  // ─── Alertas de Vencimiento Próximo ───
  const alerts = useMemo(() => {
    const today = new Date();
    const list: any[] = [];

    data.cuentas.forEach((c: any) => {
      if (c.fecha_expiracion) {
        const dias = differenceInDays(parseISO(c.fecha_expiracion), today);
        if (dias >= 0 && dias <= 7) {
          list.push({ type: 'cuenta', title: `Expira: ${c.email}`, platform: c.plataforma, date: c.fecha_expiracion, dias });
        }
      }
    });

    data.contratos.forEach((con: any) => {
      if (con.fecha_proximo_pago) {
        const dias = differenceInDays(parseISO(con.fecha_proximo_pago), today);
        if (dias >= 0 && dias <= 5) {
          list.push({ type: 'contrato', title: `Cobrar: ${con.cliente}`, platform: con.plataforma, date: con.fecha_proximo_pago, dias });
        }
      }
    });

    return list.sort((a, b) => a.dias - b.dias).slice(0, 5);
  }, [data.cuentas, data.contratos]);

  if (loading) return <div className="loading-state">Analizando inventario y activos...</div>;

  return (
    <div className="dashboard-container">
      {/* ─── Header ─── */}
      <header className="dashboard-header">
        <div className="dashboard-header__welcome">
          <h1>Panel de Control</h1>
          <p>Resumen operativo y gestión de inventario</p>
        </div>
        <div className="dashboard-header__date">
          <Calendar size={18} />
          {formatFullDate(new Date().toISOString())}
        </div>
      </header>

      {/* ─── KPI Grid ─── */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card__icon" style={{ backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-500)' }}>
            <Users size={28} />
          </div>
          <div className="kpi-card__content">
            <span className="kpi-card__label">Clientes Activos</span>
            <span className="kpi-card__value">{stats.totalClientes}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__icon" style={{ backgroundColor: 'var(--color-success-50)', color: 'var(--color-success-500)' }}>
            <TrendingUp size={28} />
          </div>
          <div className="kpi-card__content">
            <span className="kpi-card__label">Perfiles Libres</span>
            <span className="kpi-card__value" style={{ color: 'var(--color-success-600)' }}>{stats.perfilesLibres} disponibles</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__icon" style={{ backgroundColor: 'var(--color-error-50)', color: 'var(--color-error-500)' }}>
            <AlertCircle size={28} />
          </div>
          <div className="kpi-card__content">
            <span className="kpi-card__label">Alertas Urgentes</span>
            <span className="kpi-card__value" style={{ color: stats.urgentes > 0 ? 'var(--color-error-600)' : 'var(--color-gray-400)' }}>
              {stats.urgentes} por revisar
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__icon" style={{ backgroundColor: 'var(--color-warning-50)', color: 'var(--color-warning-500)' }}>
            <Smartphone size={28} />
          </div>
          <div className="kpi-card__content">
            <span className="kpi-card__label">Cuentas Totales</span>
            <span className="kpi-card__value">{stats.totalCuentas} activas</span>
          </div>
        </div>
      </section>

      {/* ─── Main Charts & Alerts ─── */}
      <div className="dashboard-main-grid">
        <div className="chart-container">
          <div className="chart-header">
            <h3><Activity size={18} style={{display:'inline', marginRight:8}}/> Ocupación de Perfiles por Plataforma</h3>
            <div className="badge badge--info">Estado de Inventario</div>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="ocupados" stackId="1" stroke="#4c6ef5" fill="#4c6ef5" fillOpacity={0.6} name="Perfiles Ocupados" />
                <Area type="monotone" dataKey="libres" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Perfiles Libres" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="alerts-card">
          <div className="alerts-header">
            <AlertCircle size={20} color="var(--color-error-500)" />
            <h3>Alertas Críticas</h3>
          </div>
          <div className="alerts-list">
            {alerts.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px', color: 'var(--color-gray-400)' }}>Sin alertas para esta semana</p>
            ) : (
              alerts.map((alert, i) => (
                <div key={i} className="alert-item">
                  <div className="alert-item__icon" style={{ backgroundColor: alert.type === 'cuenta' ? 'var(--color-error-50)' : 'var(--color-warning-50)' }}>
                    {alert.type === 'cuenta' ? <Smartphone size={18} color="var(--color-error-500)"/> : <DollarSign size={18} color="var(--color-warning-500)"/>}
                  </div>
                  <div className="alert-item__info">
                    <span className="alert-item__title">{alert.title}</span>
                    <span className="alert-item__desc">{alert.platform}</span>
                  </div>
                  <span className="alert-item__date">
                    {alert.dias === 0 ? '¡Hoy!' : `en ${alert.dias}d`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <div className="chart-container">
          <div className="chart-header">
            <h3><PieChartIcon size={18} style={{display:'inline', marginRight:8}}/> Distribución por Plataforma</h3>
          </div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={platformData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="middle" align="right" layout="vertical" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container" style={{ background: 'var(--gradient-primary)', color: '#ffffff' }}>
            <div className="chart-header">
                <h3 style={{ color: '#ffffff' }}>Eficiencia de Stock</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>
                    {((stats.capacidadOcupada / (stats.capacidadTotal || 1)) * 100).toFixed(1)}%
                </div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                    De tus perfiles totales están generando ingresos actualmente. 
                    ¡Sigue así!
                </p>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(stats.capacidadOcupada / (stats.capacidadTotal || 1)) * 100}%`, height: '100%', background: '#ffffff' }}></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;