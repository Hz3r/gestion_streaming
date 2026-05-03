import { useMemo, useState, useEffect } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";
import {
  Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle,
  X, Download, Lock,
  ShieldAlert
} from "lucide-react";
import * as XLSX from "xlsx";
import { getResumenAnual, getPendientesMensual, cerrarMes } from "../services/dashboardService";
import { useToast } from "../context/ToastContext";
import FormModal from "../components/common/FormModal";
import FormInput from "../components/common/FormInput";

type FinanzasMes = {
  mes: number;
  anio: number;
  ingresos_reales: number;
  ingresos_pendientes: number;
  ingresos_proyectados: number;
  inversiones: number;
  gastos_perdidas: number;
  utilidad_neta: number;
};

type CuentaDetalle = {
  email_cuenta: string;
  nombre_plataforma: string;
  perfiles_alquilados: number;
};

type ContratoPendiente = {
  id_contrato: number;
  nombre_cliente: string;
  detalles: CuentaDetalle[] | string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  precio_total: number;
};

const MESES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

const MESES_FULL = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const COLORS = {
  cobrado: "#10b981",    // Verde Esmeralda
  pendiente: "#f59e0b",  // Ámbar
  inversion: "#3b82f6",  // Azul Brillante
  gastos: "#f43f5e",     // Rosa/Rojo
  utilidad: "#8b5cf6",   // Violeta
};

const FinanzasPage = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<FinanzasMes[]>([]);
  const [loading, setLoading] = useState(true);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(new Date().getFullYear());
  const [mesDetalle, setMesDetalle] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'Directas' | 'Lank'>(
    (localStorage.getItem('finanzas_tab') as any) || 'Lank'
  );

  useEffect(() => {
    localStorage.setItem('finanzas_tab', activeTab);
  }, [activeTab]);

  const [pendientes, setPendientes] = useState<ContratoPendiente[]>([]);
  const [loadingPendientes, setLoadingPendientes] = useState(false);
  const [mostrarPendientes, setMostrarPendientes] = useState(false);
  
  const [cerrarMesModalOpen, setCerrarMesModalOpen] = useState(false);
  const [montoStaff, setMontoStaff] = useState("300");

  useEffect(() => {
    fetchData();
  }, [anioSeleccionado, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getResumenAnual(anioSeleccionado, activeTab);
      console.log(`Datos Finanzas (${activeTab}):`, res.data);
      const fullData = Array.from({ length: 12 }, (_, i) => {
        const mes = i + 1;
        const exist = res.data.find((d: any) => d.mes === mes);
        return exist || {
          mes, anio: anioSeleccionado,
          ingresos_reales: 0, ingresos_pendientes: 0, ingresos_proyectados: 0,
          inversiones: 0, gastos_perdidas: 0, utilidad_neta: 0
        };
      });
      setData(fullData);
    } catch (error) {
      console.error("Error al cargar finanzas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarMes = async () => {
    const mes = mesDetalle ?? new Date().getMonth() + 1;
    try {
      await cerrarMes({ mes, anio: anioSeleccionado, montoStaff: Number(montoStaff) });
      showToast("Mes cerrado con éxito", "success");
      setCerrarMesModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error al cerrar mes:", error);
      showToast("Error al cerrar mes", "error");
    }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(chartData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resumen Financiero");
    XLSX.writeFile(wb, `Reporte_Finanzas_${activeTab}_${anioSeleccionado}.xlsx`);
  };

  const handleVerPendientes = async () => {
    const mes = mesDetalle ?? new Date().getMonth() + 1;
    setLoadingPendientes(true);
    setMostrarPendientes(true);
    try {
      const res = await getPendientesMensual(mes, anioSeleccionado, activeTab);
      setPendientes(res.data);
    } catch (error) {
      console.error("Error al cargar pendientes:", error);
    } finally {
      setLoadingPendientes(false);
    }
  };

  const datosMesActual = useMemo(() => {
    const mesActual = mesDetalle ?? new Date().getMonth() + 1;
    return data.find(d => d.mes === mesActual) || {
      mes: mesActual, anio: anioSeleccionado,
      ingresos_reales: 0, ingresos_pendientes: 0, ingresos_proyectados: 0,
      inversiones: 0, gastos_perdidas: 0, utilidad_neta: 0
    };
  }, [data, mesDetalle, anioSeleccionado]);

  const chartData = useMemo(() =>
    data.map(d => ({
      mes: MESES[d.mes - 1],
      "Cobrado": Number(d.ingresos_reales),
      "Pendiente": Number(d.ingresos_pendientes),
      "Inversión": Number(d.inversiones),
      "Gastos/Pérdidas": Number(d.gastos_perdidas),
      "Utilidad": Number(d.utilidad_neta),
    })), [data]);

  const pieData = useMemo(() => [
    { name: "Cobrado", value: Number(datosMesActual.ingresos_reales) },
    { name: "Pendiente", value: Number(datosMesActual.ingresos_pendientes) },
    { name: "Inversión", value: Number(datosMesActual.inversiones) },
    { name: "Gastos/Pérdidas", value: Number(datosMesActual.gastos_perdidas) },
  ].filter(p => p.value > 0), [datosMesActual]);

  const parseCuentas = (cuentasRaw: any): CuentaDetalle[] => {
    if (!cuentasRaw) return [];
    if (typeof cuentasRaw === "string") {
      try { return JSON.parse(cuentasRaw); } catch { return []; }
    }
    return cuentasRaw as CuentaDetalle[];
  };

  const columnsPendientes = useMemo<MRT_ColumnDef<ContratoPendiente>[]>(() => [
    { accessorKey: "id_contrato", header: "ID", size: 60 },
    { accessorKey: "nombre_cliente", header: "Cliente", size: 160 },
    {
      accessorKey: "detalles",
      header: "Cuentas y Plataformas",
      size: 250,
      Cell: ({ cell }) => {
        const arr = parseCuentas(cell.getValue<any>());
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {arr.map((c, i) => (
              <div key={i} style={{ fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600 }}>{c.nombre_plataforma}</span>: {c.email_cuenta} ({c.perfiles_alquilados} perf.)
              </div>
            ))}
          </div>
        );
      }
    },
    {
      accessorKey: "fecha_vencimiento",
      header: "Vencimiento",
      size: 100,
      Cell: ({ cell }) => cell.getValue<string>()?.split("T")[0]
    },
    {
      accessorKey: "precio_total",
      header: "Monto",
      size: 90,
      Cell: ({ cell }) => (
        <span style={{ color: "var(--color-warning-700)", fontWeight: 600 }}>
          S/ {Number(cell.getValue<number>()).toFixed(2)}
        </span>
      ),
    },
  ], []);

  const mesActualLabel = MESES_FULL[(mesDetalle ?? new Date().getMonth() + 1) - 1];

  return (
    <div className="finanzas-page">
      <div className="finanzas-page__header">
        <div className="period-filter">
          <Calendar size={18} className="period-filter__icon" />
          <select
            className="period-filter__select"
            value={anioSeleccionado}
            onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
          >
            {[2024, 2025, 2026].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select
            className="period-filter__select"
            value={mesDetalle ?? "actual"}
            onChange={(e) => setMesDetalle(e.target.value === "actual" ? null : Number(e.target.value))}
          >
            <option value="actual">Mes actual</option>
            {MESES_FULL.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>

        <div className="finanzas-tabs">
          <button
            className={`finanzas-tab ${activeTab === 'Directas' ? 'finanzas-tab--active' : ''}`}
            onClick={() => setActiveTab('Directas')}
          >
            Directas
          </button>
          <button
            className={`finanzas-tab ${activeTab === 'Lank' ? 'finanzas-tab--active' : ''}`}
            onClick={() => setActiveTab('Lank')}
          >
            Lank
          </button>
        </div>

        <div className="header-actions">
          <button className="btn-export" onClick={handleExport}>
            <Download size={16} />
            Reporte Excel
          </button>
        </div>
      </div>
      <div className="finanzas-kpi-grid" style={{ gridTemplateColumns: activeTab === 'Lank' ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
        <div 
          className="finanzas-kpi finanzas-kpi--real finanzas-kpi--clickable"
          onClick={handleVerPendientes}
        >
          <div className="finanzas-kpi__icon-wrap finanzas-kpi__icon-wrap--real" style={{ backgroundColor: COLORS.cobrado }}>
            <CheckCircle size={22} color="white" />
          </div>
          <div className="finanzas-kpi__content">
            <span className="finanzas-kpi__label">
              {activeTab === 'Lank' ? 'Ingresos Cobrados' : 'Ingresos Brutos'}
            </span>
            <span className="finanzas-kpi__sublabel">{mesActualLabel} (Real)</span>
            <span className="finanzas-kpi__value" style={{ color: COLORS.cobrado }}>
              S/ {Number(datosMesActual.ingresos_reales).toFixed(2)}
            </span>
          </div>
        </div>

        {activeTab === 'Lank' && (
          <div className="finanzas-kpi finanzas-kpi--proyectado">
            <div className="finanzas-kpi__icon-wrap finanzas-kpi__icon-wrap--proyectado" style={{ backgroundColor: COLORS.pendiente }}>
              <TrendingUp size={22} color="white" />
            </div>
            <div className="finanzas-kpi__content">
              <span className="finanzas-kpi__label">Ingresos Proyectados</span>
              <span className="finanzas-kpi__sublabel">Total estimado</span>
              <span className="finanzas-kpi__value" style={{ color: COLORS.pendiente }}>
                S/ {Number(datosMesActual.ingresos_proyectados).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {activeTab === 'Lank' && (
          <div className="finanzas-kpi finanzas-kpi--pendiente">
            <div className="finanzas-kpi__icon-wrap finanzas-kpi__icon-wrap--pendiente" style={{ backgroundColor: COLORS.pendiente, opacity: 0.8 }}>
              <AlertCircle size={22} color="white" />
            </div>
            <div className="finanzas-kpi__content">
              <span className="finanzas-kpi__label">Ingresos Pendientes</span>
              <span className="finanzas-kpi__sublabel">Por cobrar</span>
              <span className="finanzas-kpi__value" style={{ color: COLORS.pendiente }}>
                S/ {Number(datosMesActual.ingresos_pendientes).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div className="finanzas-kpi finanzas-kpi--proyectado">
          <div className="finanzas-kpi__icon-wrap finanzas-kpi__icon-wrap--proyectado" style={{ backgroundColor: COLORS.inversion }}>
            <Calendar size={22} color="white" />
          </div>
          <div className="finanzas-kpi__content">
            <span className="finanzas-kpi__label">Inversión del Mes</span>
            <span className="finanzas-kpi__sublabel">Cuentas compradas</span>
            <span className="finanzas-kpi__value" style={{ color: COLORS.inversion }}>
              S/ {Number(datosMesActual.inversiones).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="finanzas-kpi finanzas-kpi--pendiente">
          <div className="finanzas-kpi__icon-wrap finanzas-kpi__icon-wrap--pendiente" style={{ backgroundColor: COLORS.gastos }}>
            <ShieldAlert size={22} color="white" />
          </div>
          <div className="finanzas-kpi__content">
            <span className="finanzas-kpi__label">Baneos y Gastos</span>
            <span className="finanzas-kpi__sublabel">Pérdidas Lank</span>
            <span className="finanzas-kpi__value" style={{ color: COLORS.gastos }}>
              S/ {Number(datosMesActual.gastos_perdidas).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="finanzas-kpi finanzas-kpi--utilidad">
          <div className="finanzas-kpi__icon-wrap finanzas-kpi__icon-wrap--utilidad" style={{ backgroundColor: COLORS.utilidad }}>
            <DollarSign size={22} color="white" />
          </div>
          <div className="finanzas-kpi__content">
            <span className="finanzas-kpi__label">Utilidad Neta</span>
            <span className="finanzas-kpi__sublabel">Cobrado - Egresos</span>
            <span className="finanzas-kpi__value" style={{ color: COLORS.utilidad }}>
              S/ {Number(datosMesActual.utilidad_neta).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="finanzas-charts">
        <div className="finanzas-chart-card finanzas-chart-card--bar">
          <div className="finanzas-chart-card__header">
            <h5>Evolución Financiera — {anioSeleccionado}</h5>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mes" />
              <YAxis />
              <RTooltip />
              <Legend />
              <Bar dataKey="Cobrado" fill={COLORS.cobrado} radius={[4, 4, 0, 0]} />
              {activeTab === 'Lank' && <Bar dataKey="Pendiente" fill={COLORS.pendiente} radius={[4, 4, 0, 0]} />}
              <Bar dataKey="Inversión" fill={COLORS.inversion} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Gastos/Pérdidas" fill={COLORS.gastos} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="finanzas-chart-card finanzas-chart-card--donut">
          <div className="finanzas-chart-card__header">
            <h5>Distribución {mesActualLabel}</h5>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={60} outerRadius={85}
                paddingAngle={5} dataKey="value"
              >
                {pieData.map((entry) => {
                  let color = COLORS.cobrado;
                  if (entry.name === "Pendiente") color = COLORS.pendiente;
                  if (entry.name === "Inversión") color = COLORS.inversion;
                  if (entry.name === "Gastos/Pérdidas") color = COLORS.gastos;
                  return <Cell key={entry.name} fill={color} />;
                })}
              </Pie>
              <Legend />
              <RTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="finanzas-chart-card">
        <div className="finanzas-chart-card__header">
          <h5>Resumen de Utilidades — {anioSeleccionado}</h5>
        </div>
        <div className="finanzas-summary-table">
          <table>
            <thead>
              <tr>
                <th>Mes</th>
                <th>{activeTab === 'Lank' ? 'Cobrado' : 'Ingresos Brutos'}</th>
                <th>Pendientes</th>
                <th>Proyectado</th>
                <th>Inversión</th>
                <th>Gastos/Pérdidas</th>
                <th>Utilidad Neta</th>
              </tr>
            </thead>
            <tbody>
              {data.filter(d => Number(d.ingresos_proyectados) > 0 || Number(d.gastos_perdidas) > 0 || Number(d.inversiones) > 0).map((d) => (
                <tr key={d.mes}>
                  <td>{MESES_FULL[d.mes - 1]}</td>
                  <td style={{ fontWeight: 'bold', color: COLORS.cobrado }}>S/ {Number(d.ingresos_reales).toFixed(2)}</td>
                  <td style={{ color: COLORS.pendiente }}>S/ {Number(d.ingresos_pendientes).toFixed(2)}</td>
                  <td style={{ color: COLORS.pendiente, opacity: 0.8 }}>S/ {Number(d.ingresos_proyectados).toFixed(2)}</td>
                  <td style={{ color: COLORS.inversion }}>S/ {Number(d.inversiones).toFixed(2)}</td>
                  <td style={{ color: COLORS.gastos }}>S/ {Number(d.gastos_perdidas).toFixed(2)}</td>
                  <td style={{ fontWeight: 'bold', color: COLORS.utilidad }}>S/ {Number(d.utilidad_neta).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <button
          className="btn-secondary"
          onClick={handleCerrarMes}
          style={{ opacity: 0.6, fontSize: '0.75rem' }}
        >
          <Lock size={14} />
          Realizar Cierre Mensual (Historial)
        </button>
      </div>

      {mostrarPendientes && (
        <div className="finanzas-modal-overlay">
          <div className="finanzas-modal">
            <div className="finanzas-modal__header">
              <h3>Contratos Pendientes — {mesActualLabel}</h3>
              <button onClick={() => setMostrarPendientes(false)}><X size={20} /></button>
            </div>
            <div className="finanzas-modal__body">
              <DataTable<ContratoPendiente>
                columns={columnsPendientes}
                data={pendientes}
                isLoading={loadingPendientes}
              />
            </div>
          </div>
        </div>
      )}

      <FormModal
        isOpen={cerrarMesModalOpen}
        onClose={() => setCerrarMesModalOpen(false)}
        title={`Cerrar Mes — ${mesActualLabel}`}
        icon={<Lock size={20} />}
        size="sm"
        footer={
          <div className="modal-footer-actions">
            <button className="btn-secondary" onClick={() => setCerrarMesModalOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleCerrarMes}>Confirmar Cierre</button>
          </div>
        }
      >
        <div className="form-grid form-grid--single">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Ingrese el monto total pagado al Staff para este periodo ({mesActualLabel} {anioSeleccionado}).
          </p>
          <FormInput
            label="Monto Staff (S/)"
            name="montoStaff"
            type="number"
            value={montoStaff}
            onChange={(e) => setMontoStaff(e.target.value)}
            required
          />
        </div>
      </FormModal>
    </div>
  );
};

export default FinanzasPage;
