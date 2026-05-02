import { useMemo, useState, useEffect } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";
import {
  Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle,
  X, Download, Lock
} from "lucide-react";
import * as XLSX from "xlsx";
import { getResumenAnual, getPendientesMensual, cerrarMes } from "../services/dashboardService";

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

type ContratoPendiente = {
  id_contrato: number;
  cliente: string;
  cuenta: string;
  plataforma: string;
  perfiles_alquilados: number;
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
  real: "#41c98e",
  pendiente: "#ffbb38",
  inversion: "#4c6ef5",
  gastos: "#fa5252",
  utilidad: "#7c5cfc",
  pie: ["#41c98e", "#ffbb38", "#fa5252"],
};

const FinanzasPage = () => {
  const [data, setData] = useState<FinanzasMes[]>([]);
  const [loading, setLoading] = useState(true);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(new Date().getFullYear());
  const [mesDetalle, setMesDetalle] = useState<number | null>(null);
  
  const [pendientes, setPendientes] = useState<ContratoPendiente[]>([]);
  const [loadingPendientes, setLoadingPendientes] = useState(false);
  const [mostrarPendientes, setMostrarPendientes] = useState(false);

  useEffect(() => {
    fetchData();
  }, [anioSeleccionado]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getResumenAnual(anioSeleccionado);
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
    const monto = prompt(`Ingrese el monto total de pago a Staff para ${MESES_FULL[mes-1]}:`, "300");
    if (!monto) return;

    try {
      await cerrarMes({ mes, anio: anioSeleccionado, montoStaff: Number(monto) });
      alert("Mes cerrado con éxito");
      fetchData();
    } catch (error) {
      console.error("Error al cerrar mes:", error);
    }
  };

  const handleVerPendientes = async () => {
    const mes = mesDetalle ?? new Date().getMonth() + 1;
    setLoadingPendientes(true);
    setMostrarPendientes(true);
    try {
      const res = await getPendientesMensual(mes, anioSeleccionado);
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
      "Ingreso Real": Number(d.ingresos_reales),
      "Inversión": Number(d.inversiones),
      "Gastos/Pérdidas": Number(d.gastos_perdidas),
      "Utilidad Neta": Number(d.utilidad_neta),
    })), [data]);

  const pieData = useMemo(() => [
    { name: "Ingreso", value: Number(datosMesActual.ingresos_reales) },
    { name: "Inversión", value: Number(datosMesActual.inversiones) },
    { name: "Gastos/Pérdidas", value: Number(datosMesActual.gastos_perdidas) },
  ], [datosMesActual]);

  const columnsPendientes = useMemo<MRT_ColumnDef<ContratoPendiente>[]>(() => [
    { accessorKey: "id_contrato", header: "ID", size: 60 },
    { accessorKey: "cliente", header: "Cliente", size: 160 },
    { accessorKey: "cuenta", header: "Cuenta", size: 200 },
    { accessorKey: "plataforma", header: "Plataforma", size: 120 },
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
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleCerrarMes}>
            <Lock size={16} />
            Cerrar Mes
          </button>
          <button className="btn-export" onClick={() => {}}>
            <Download size={16} />
            Reporte
          </button>
        </div>
      </div>

      <div className="finanzas-kpi-grid">
        <div className="finanzas-kpi finanzas-kpi--real">
          <div className="finanzas-kpi__icon-wrap finanzas-kpi__icon-wrap--real">
            <CheckCircle size={22} />
          </div>
          <div className="finanzas-kpi__content">
            <span className="finanzas-kpi__label">Ingresos Brutos</span>
            <span className="finanzas-kpi__sublabel">{mesActualLabel} (Cobrado)</span>
            <span className="finanzas-kpi__value finanzas-kpi__value--real">
              S/ {Number(datosMesActual.ingresos_reales).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="finanzas-kpi finanzas-kpi--proyectado">
          <div className="finanzas-kpi__icon-wrap finanzas-kpi__icon-wrap--proyectado">
            <TrendingUp size={22} />
          </div>
          <div className="finanzas-kpi__content">
            <span className="finanzas-kpi__label">Inversión del Mes</span>
            <span className="finanzas-kpi__sublabel">Cuentas compradas</span>
            <span className="finanzas-kpi__value finanzas-kpi__value--proyectado">
              S/ {Number(datosMesActual.inversiones).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="finanzas-kpi finanzas-kpi--pendiente">
          <div className="finanzas-kpi__icon-wrap finanzas-kpi__icon-wrap--pendiente">
            <AlertCircle size={22} />
          </div>
          <div className="finanzas-kpi__content">
            <span className="finanzas-kpi__label">Gastos y Pérdidas</span>
            <span className="finanzas-kpi__sublabel">Baneos + Operación</span>
            <span className="finanzas-kpi__value finanzas-kpi__value--pendiente">
              S/ {Number(datosMesActual.gastos_perdidas).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="finanzas-kpi finanzas-kpi--utilidad">
          <div className="finanzas-kpi__icon-wrap finanzas-kpi__icon-wrap--utilidad">
            <DollarSign size={22} />
          </div>
          <div className="finanzas-kpi__content">
            <span className="finanzas-kpi__label">Utilidad Neta</span>
            <span className="finanzas-kpi__sublabel">Dinero disponible</span>
            <span className="finanzas-kpi__value finanzas-kpi__value--utilidad">
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
              <Bar dataKey="Ingreso Real" fill={COLORS.real} radius={[4, 4, 0, 0]} />
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
                {pieData.map((_, i) => <Cell key={i} fill={COLORS.pie[i % COLORS.pie.length]} />)}
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
                <th>Ingresos</th>
                <th>Inversión</th>
                <th>Gastos/Pérdidas</th>
                <th>Utilidad Neta</th>
              </tr>
            </thead>
            <tbody>
              {data.filter(d => Number(d.ingresos_proyectados) > 0 || Number(d.gastos_perdidas) > 0 || Number(d.inversiones) > 0).map((d) => (
                <tr key={d.mes}>
                  <td>{MESES_FULL[d.mes - 1]}</td>
                  <td className="td-real">S/ {Number(d.ingresos_reales).toFixed(2)}</td>
                  <td className="td-proyectado">S/ {Number(d.inversiones).toFixed(2)}</td>
                  <td className="td-pendiente">S/ {Number(d.gastos_perdidas).toFixed(2)}</td>
                  <td className="td-utilidad">S/ {Number(d.utilidad_neta).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    </div>
  );
};

export default FinanzasPage;
