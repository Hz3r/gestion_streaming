import { useMemo, useState, useEffect } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";
import {
  Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle,
  X, Download
} from "lucide-react";
import * as XLSX from "xlsx";
import { getResumenAnual, getPendientesMensual } from "../services/dashboardService";

type FinanzasMes = {
  mes: number;
  anio: number;
  ingresos_reales: number;
  ingresos_pendientes: number;
  ingresos_proyectados: number;
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
  proyectado: "#4c6ef5",
  pie: ["#41c98e", "#ffbb38"],
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
      // Rellenar meses faltantes con ceros para el gráfico
      const fullData = Array.from({ length: 12 }, (_, i) => {
        const mes = i + 1;
        const exist = res.data.find((d: any) => d.mes === mes);
        return exist || { mes, anio: anioSeleccionado, ingresos_reales: 0, ingresos_pendientes: 0, ingresos_proyectados: 0 };
      });
      setData(fullData);
    } catch (error) {
      console.error("Error al cargar finanzas:", error);
    } finally {
      setLoading(false);
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

  const datosAnuales = data;

  const datosMesActual = useMemo(() => {
    const mesActual = mesDetalle ?? new Date().getMonth() + 1;
    return datosAnuales.find(d => d.mes === mesActual) || {
      mes: mesActual, anio: anioSeleccionado,
      ingresos_reales: 0, ingresos_pendientes: 0, ingresos_proyectados: 0,
    };
  }, [datosAnuales, mesDetalle, anioSeleccionado]);

  const totalesAnuales = useMemo(() => ({
    real: datosAnuales.reduce((s, d) => s + Number(d.ingresos_reales), 0),
    pendiente: datosAnuales.reduce((s, d) => s + Number(d.ingresos_pendientes), 0),
    proyectado: datosAnuales.reduce((s, d) => s + Number(d.ingresos_proyectados), 0),
  }), [datosAnuales]);

  const chartData = useMemo(() =>
    datosAnuales.map(d => ({
      mes: MESES[d.mes - 1],
      mesNum: d.mes,
      "Ingreso Real": Number(d.ingresos_reales),
      "Pendiente": Number(d.ingresos_pendientes),
      "Proyectado": Number(d.ingresos_proyectados),
    })), [datosAnuales]);

  const pieData = useMemo(() => [
    { name: "Cobrado", value: Number(datosMesActual.ingresos_reales) },
    { name: "Pendiente", value: Number(datosMesActual.ingresos_pendientes) },
  ], [datosMesActual]);

  const pctCobranza = useMemo(() => {
    if (Number(datosMesActual.ingresos_proyectados) === 0) return 0;
    return Math.round((Number(datosMesActual.ingresos_reales) / Number(datosMesActual.ingresos_proyectados)) * 100);
  }, [datosMesActual]);

  const columnsPendientes = useMemo<MRT_ColumnDef<ContratoPendiente>[]>(() => [
    { accessorKey: "id_contrato", header: "ID", size: 60 },
    { accessorKey: "cliente", header: "Cliente", size: 160 },
    { accessorKey: "cuenta", header: "Cuenta", size: 200 },
    { accessorKey: "plataforma", header: "Plataforma", size: 120 },
    { accessorKey: "perfiles_alquilados", header: "Perfiles", size: 80 },
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

  const exportarExcel = () => {
    const ws1 = XLSX.utils.json_to_sheet(datosAnuales.map(d => ({
      "Mes": MESES_FULL[d.mes - 1],
      "Año": d.anio,
      "Ingresos Reales": d.ingresos_reales,
      "Ingresos Pendientes": d.ingresos_pendientes,
      "Ingresos Proyectados": d.ingresos_proyectados,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, `Finanzas_${anioSeleccionado}`);
    XLSX.writeFile(wb, `Reporte_Finanzas_${anioSeleccionado}.xlsx`);
  };

  const mesActualLabel = MESES_FULL[(mesDetalle ?? new Date().getMonth() + 1) - 1];

  const aniosDisponibles = [2024, 2025, 2026]; // Podría ser dinámico si el backend retorna años

  return (
    <div className="finanzas-page">
      <div className="finanzas-page__header">
        <div className="period-filter">
          <Calendar size={18} className="period-filter__icon" />
          <select
            className="period-filter__select"
            value={anioSeleccionado}
            onChange={(e) => {
              setAnioSeleccionado(Number(e.target.value));
              setMesDetalle(null);
            }}
          >
            {aniosDisponibles.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select
            className="period-filter__select"
            value={mesDetalle ?? "actual"}
            onChange={(e) => {
              const v = e.target.value;
              setMesDetalle(v === "actual" ? null : Number(v));
            }}
          >
            <option value="actual">Mes actual</option>
            {MESES_FULL.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <button className="btn-export" onClick={exportarExcel}>
          <Download size={16} />
          Exportar Reporte
        </button>
      </div>

      <div className="finanzas-kpi-grid">
        <div className="finanzas-kpi finanzas-kpi--real">
          <div className="finanzas-kpi__icon-wrap finanzas-kpi__icon-wrap--real">
            <CheckCircle size={22} />
          </div>
          <div className="finanzas-kpi__content">
            <span className="finanzas-kpi__label">Dinero Real</span>
            <span className="finanzas-kpi__sublabel">{mesActualLabel} {anioSeleccionado}</span>
            <span className="finanzas-kpi__value finanzas-kpi__value--real">
              S/ {Number(datosMesActual.ingresos_reales).toFixed(2)}
            </span>
          </div>
        </div>

        <div 
          className="finanzas-kpi finanzas-kpi--pendiente clickable" 
          onClick={handleVerPendientes}
          title="Ver detalle de pendientes"
        >
          <div className="finanzas-kpi__icon-wrap finanzas-kpi__icon-wrap--pendiente">
            <AlertCircle size={22} />
          </div>
          <div className="finanzas-kpi__content">
            <span className="finanzas-kpi__label">Dinero Pendiente</span>
            <span className="finanzas-kpi__sublabel">{mesActualLabel}</span>
            <span className="finanzas-kpi__value finanzas-kpi__value--pendiente">
              S/ {Number(datosMesActual.ingresos_pendientes).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="finanzas-kpi finanzas-kpi--proyectado">
          <div className="finanzas-kpi__icon-wrap finanzas-kpi__icon-wrap--proyectado">
            <TrendingUp size={22} />
          </div>
          <div className="finanzas-kpi__content">
            <span className="finanzas-kpi__label">Dinero Proyectado</span>
            <span className="finanzas-kpi__sublabel">Real + Pendiente</span>
            <span className="finanzas-kpi__value finanzas-kpi__value--proyectado">
              S/ {Number(datosMesActual.ingresos_proyectados).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="finanzas-kpi finanzas-kpi--pct">
          <div className="finanzas-kpi__icon-wrap finanzas-kpi__icon-wrap--pct">
            <DollarSign size={22} />
          </div>
          <div className="finanzas-kpi__content">
            <span className="finanzas-kpi__label">Tasa de Cobro</span>
            <span className="finanzas-kpi__sublabel">{mesActualLabel}</span>
            <span className="finanzas-kpi__value finanzas-kpi__value--pct">
              {pctCobranza}%
            </span>
          </div>
          <div className="finanzas-kpi__progress">
            <div
              className="finanzas-kpi__progress-fill"
              style={{ width: `${pctCobranza}%` }}
            />
          </div>
        </div>
      </div>

      <div className="finanzas-charts">
        <div className="finanzas-chart-card finanzas-chart-card--bar">
          <div className="finanzas-chart-card__header">
            <h5>Ingresos Mensuales — {anioSeleccionado}</h5>
            <div className="finanzas-chart-card__legend">
              <span className="legend-dot" style={{ background: COLORS.real }} /> Real
              <span className="legend-dot" style={{ background: COLORS.pendiente }} /> Pendiente
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
              <XAxis
                dataKey="mes" tick={{ fill: "var(--color-gray-600)", fontSize: 12 }}
                axisLine={{ stroke: "var(--color-gray-200)" }}
              />
              <YAxis
                tick={{ fill: "var(--color-gray-600)", fontSize: 12 }}
                axisLine={{ stroke: "var(--color-gray-200)" }}
                tickFormatter={(v) => `S/${v}`}
              />
              <RTooltip
                contentStyle={{
                  background: "var(--bg-card)", border: "1px solid var(--color-gray-200)",
                  borderRadius: "10px", fontSize: "13px", boxShadow: "var(--shadow-md)"
                }}
                formatter={(value: number) => [`S/ ${value.toFixed(2)}`, undefined]}
              />
              <Bar dataKey="Ingreso Real" fill={COLORS.real} radius={[6, 6, 0, 0]} />
              <Bar dataKey="Pendiente" fill={COLORS.pendiente} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="finanzas-chart-card finanzas-chart-card--donut">
          <div className="finanzas-chart-card__header">
            <h5>Distribución — {mesActualLabel}</h5>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={95}
                paddingAngle={4} dataKey="value"
                stroke="none"
              >
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS.pie[idx]} />
                ))}
              </Pie>
              <Legend
                iconType="circle" iconSize={10}
                formatter={(value) => <span style={{ color: "var(--color-gray-700)", fontSize: 13 }}>{value}</span>}
              />
              <RTooltip formatter={(value: number) => [`S/ ${value.toFixed(2)}`, undefined]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="finanzas-donut-center">
            <span className="finanzas-donut-center__value">{pctCobranza}%</span>
            <span className="finanzas-donut-center__label">Cobrado</span>
          </div>
        </div>
      </div>

      {mostrarPendientes && (
        <div className="finanzas-modal-overlay">
          <div className="finanzas-modal">
            <div className="finanzas-modal__header">
              <h3>Contratos Pendientes — {mesActualLabel}</h3>
              <button onClick={() => setMostrarPendientes(false)}>
                <X size={20} />
              </button>
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

      <div className="finanzas-chart-card finanzas-chart-card--area">
        <div className="finanzas-chart-card__header">
          <h5>Tendencia de Ingresos Proyectados — {anioSeleccionado}</h5>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gradientProyectado" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.proyectado} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.proyectado} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
            <XAxis
              dataKey="mes" tick={{ fill: "var(--color-gray-600)", fontSize: 12 }}
              axisLine={{ stroke: "var(--color-gray-200)" }}
            />
            <YAxis
              tick={{ fill: "var(--color-gray-600)", fontSize: 12 }}
              axisLine={{ stroke: "var(--color-gray-200)" }}
              tickFormatter={(v) => `S/${v}`}
            />
            <RTooltip
              contentStyle={{
                background: "var(--bg-card)", border: "1px solid var(--color-gray-200)",
                borderRadius: "10px", fontSize: "13px", boxShadow: "var(--shadow-md)"
              }}
              formatter={(value: number) => [`S/ ${value.toFixed(2)}`, undefined]}
            />
            <Area
              type="monotone" dataKey="Proyectado"
              stroke={COLORS.proyectado} strokeWidth={2.5}
              fill="url(#gradientProyectado)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="finanzas-chart-card">
        <div className="finanzas-chart-card__header">
          <h5>Resumen Anual Detallado — {anioSeleccionado}</h5>
        </div>
        <div className="finanzas-summary-table">
          <table>
            <thead>
              <tr>
                <th>Mes</th>
                <th>Ingreso Real</th>
                <th>Pendiente</th>
                <th>Proyectado</th>
                <th>% Cobro</th>
              </tr>
            </thead>
            <tbody>
              {datosAnuales.map((d) => {
                const pct = Number(d.ingresos_proyectados) > 0
                  ? Math.round((Number(d.ingresos_reales) / Number(d.ingresos_proyectados)) * 100) : 0;
                return (
                  <tr key={d.mes}>
                    <td>{MESES_FULL[d.mes - 1]}</td>
                    <td className="td-real">S/ {Number(d.ingresos_reales).toFixed(2)}</td>
                    <td className="td-pendiente">S/ {Number(d.ingresos_pendientes).toFixed(2)}</td>
                    <td className="td-proyectado">S/ {Number(d.ingresos_proyectados).toFixed(2)}</td>
                    <td>
                      <div className="mini-progress">
                        <div className="mini-progress__fill" style={{ width: `${pct}%` }} />
                        <span>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td><strong>Total</strong></td>
                <td className="td-real"><strong>S/ {totalesAnuales.real.toFixed(2)}</strong></td>
                <td className="td-pendiente"><strong>S/ {totalesAnuales.pendiente.toFixed(2)}</strong></td>
                <td className="td-proyectado"><strong>S/ {totalesAnuales.proyectado.toFixed(2)}</strong></td>
                <td>
                  <strong>
                    {totalesAnuales.proyectado > 0
                      ? Math.round((totalesAnuales.real / totalesAnuales.proyectado) * 100)
                      : 0}%
                  </strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinanzasPage;
