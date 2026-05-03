import { useMemo, useState, useEffect } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";
import FormModal from "../components/common/FormModal";
import FormInput from "../components/common/FormInput";
import FormSelect from "../components/common/FormSelect";
import FormCombobox from "../components/common/FormCombobox";
import ConfirmDialog from "../components/common/ConfirmDialog";
import * as XLSX from "xlsx";
import { Download, Calendar, FileText, Save, Plus, Trash2, Filter } from "lucide-react";
import { 
  getContratos, createContrato, updateContrato, deleteContrato,
  getClientes, getCuentas, getMetodosPago 
} from "../services/dashboardService";

type CuentaDetalle = {
  id_cuenta: number;
  email: string;
  plataforma: string;
  perfiles_alquilados: number;
};

type Contrato = {
  id_contrato: number;
  id_cliente: number;
  cliente: string;
  cuentas: CuentaDetalle[] | string;
  id_metodo: number;
  metodo_pago: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  precio_unitario: number;
  precio_total: number;
  estado_pagado: number;
  tipo_contrato: string;
};

const INITIAL_FORM = {
  id_cliente: "", id_metodo: "", fecha_inicio: "", fecha_vencimiento: "", precio_unitario: "", estado_pagado: "0",
  tipo_contrato: "Directo",
  detalles: [{ id_cuenta: "", perfiles_alquilados: "1" }]
};

const ESTADO_PAGO_OPT = [
  { value: "1", label: "Pagado" },
  { value: "0", label: "Pendiente" },
];

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const ContratosPage = () => {
  const [data, setData] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState<{value: any, label: string, tipo: string}[]>([]);
  const [cuentas, setCuentas] = useState<{value: any, label: string, estado: string}[]>([]);
  const [metodosPago, setMetodosPago] = useState<{value: any, label: string}[]>([]);

  const [mesSeleccionado, setMesSeleccionado] = useState<number | "todos">("todos");
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(new Date().getFullYear());
  
  // Persistence for filter
  const [filtroTipo, setFiltroTipo] = useState<string>(() => {
    return localStorage.getItem("filtroTipoContrato") || "Todos";
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Contrato | null>(null);
  const [form, setForm] = useState<any>(INITIAL_FORM);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Contrato | null>(null);

  useEffect(() => {
    localStorage.setItem("filtroTipoContrato", filtroTipo);
  }, [filtroTipo]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [resContratos, resCli, resCue, resMet] = await Promise.all([
        getContratos(),
        getClientes(),
        getCuentas(),
        getMetodosPago()
      ]);
      setData(resContratos.data);
      setClientes(resCli.data.map((c: any) => ({ value: c.id_cliente, label: c.nombre, tipo: c.tipo || 'Directo' })));
      setCuentas(resCue.data.map((c: any) => ({ 
        value: c.id_cuenta, 
        label: `${c.email} — ${c.plataforma} (${c.capacidad_total - c.perfiles_en_uso} disp.)`,
        estado: c.estado
      })));
      setMetodosPago(resMet.data.map((m: any) => ({ value: m.id_metodo, label: m.nombre })));
    } catch (error) {
      console.error("Error al cargar datos de contratos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm({ ...form, [name]: checked ? "Lank" : "Directo" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleComboboxChange = (name: string, value: string | number) => {
    setForm({ ...form, [name]: value });
  };

  const handleDetalleChange = (index: number, name: string, value: string | number) => {
    const nuevosDetalles = [...form.detalles];
    nuevosDetalles[index] = { ...nuevosDetalles[index], [name]: value };
    setForm({ ...form, detalles: nuevosDetalles });
  };

  const addDetalle = () => {
    setForm({ ...form, detalles: [...form.detalles, { id_cuenta: "", perfiles_alquilados: "1" }] });
  };

  const removeDetalle = (index: number) => {
    const nuevosDetalles = form.detalles.filter((_: any, i: number) => i !== index);
    setForm({ ...form, detalles: nuevosDetalles });
  };

  const parseCuentas = (cuentasRaw: any): CuentaDetalle[] => {
    if (!cuentasRaw) return [];
    if (typeof cuentasRaw === "string") {
      try { return JSON.parse(cuentasRaw); } catch { return []; }
    }
    return cuentasRaw as CuentaDetalle[];
  };

  const openCreate = () => { setEditItem(null); setForm(INITIAL_FORM); setModalOpen(true); };
  const openEdit = (item: Contrato) => {
    setEditItem(item);
    const cuentasArr = parseCuentas(item.cuentas);
    setForm({
      id_cliente: item.id_cliente, 
      id_metodo: item.id_metodo,
      fecha_inicio: item.fecha_inicio.split("T")[0], 
      fecha_vencimiento: item.fecha_vencimiento.split("T")[0],
      precio_unitario: String(item.precio_unitario), 
      estado_pagado: String(item.estado_pagado),
      tipo_contrato: item.tipo_contrato || "Directo",
      detalles: cuentasArr.map(c => ({
        id_cuenta: c.id_cuenta,
        perfiles_alquilados: String(c.perfiles_alquilados)
      }))
    });
    setModalOpen(true);
  };
  const openDelete = (item: Contrato) => { setDeleteItem(item); setConfirmOpen(true); };

  const handleSave = async () => {
    try {
      if (form.detalles.length === 0) {
        alert("Debes agregar al menos una cuenta al contrato.");
        return;
      }
      if (form.detalles.some((d: any) => !d.id_cuenta || !d.perfiles_alquilados)) {
        alert("Por favor completa los datos de todas las cuentas.");
        return;
      }

      const totalPerfiles = form.detalles.reduce((acc: number, det: any) => acc + Number(det.perfiles_alquilados), 0);

      // Si es Lank, forzamos precio a 0 y estado_pagado a 1
      const isLank = form.tipo_contrato === "Lank";
      const precioUnitario = isLank ? 0 : Number(form.precio_unitario);
      const estadoPagado = isLank ? 1 : Number(form.estado_pagado);

      const dataToSend = {
        ...form,
        id_cliente: Number(form.id_cliente),
        id_metodo: Number(form.id_metodo),
        precio_unitario: precioUnitario,
        precio_total: totalPerfiles * precioUnitario,
        estado_pagado: estadoPagado,
        tipo_contrato: form.tipo_contrato,
        detalles: form.detalles.map((d: any) => ({
          id_cuenta: Number(d.id_cuenta),
          perfiles_alquilados: Number(d.perfiles_alquilados)
        }))
      };

      if (editItem) {
        await updateContrato(editItem.id_contrato, dataToSend);
      } else {
        await createContrato(dataToSend);
      }
      setModalOpen(false);
      fetchInitialData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al guardar el contrato");
      console.error("Error al guardar contrato:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteContrato(deleteItem.id_contrato);
      setConfirmOpen(false);
      fetchInitialData();
    } catch (error) {
      console.error("Error al eliminar contrato:", error);
    }
  };

  const datosFiltrados = useMemo(() => {
    let filtrado = data;
    
    if (filtroTipo !== "Todos") {
      filtrado = filtrado.filter(c => (c.tipo_contrato || "Directo") === filtroTipo);
    }

    if (mesSeleccionado !== "todos") {
      filtrado = filtrado.filter((c) => {
        const fecha = new Date(c.fecha_inicio);
        return fecha.getMonth() === mesSeleccionado && fecha.getFullYear() === anioSeleccionado;
      });
    }

    return filtrado;
  }, [data, mesSeleccionado, anioSeleccionado, filtroTipo]);

  const metricas = useMemo(() => {
    const totalContratos = datosFiltrados.length;
    const totalIngresos = datosFiltrados.reduce((sum, c) => sum + Number(c.precio_total), 0);
    const pagados = datosFiltrados.filter((c) => Number(c.estado_pagado) === 1).length;
    const pendientes = datosFiltrados.filter((c) => Number(c.estado_pagado) === 0).length;
    
    let totalPerfiles = 0;
    datosFiltrados.forEach(c => {
      const arr = parseCuentas(c.cuentas);
      arr.forEach(det => {
        totalPerfiles += Number(det.perfiles_alquilados);
      });
    });

    return { totalContratos, totalIngresos, pagados, pendientes, totalPerfiles };
  }, [datosFiltrados]);

  const columns = useMemo<MRT_ColumnDef<Contrato>[]>(
    () => [
      { accessorKey: "id_contrato", header: "ID", size: 60 },
      { accessorKey: "cliente", header: "Cliente", size: 150 },
      {
        accessorKey: "tipo_contrato",
        header: "Tipo",
        size: 90,
        Cell: ({ cell }) => {
          const val = cell.getValue<string>() || "Directo";
          return <span className={val === "Lank" ? "badge badge--info" : "badge badge--warning"}>{val}</span>;
        }
      },
      { 
        accessorKey: "cuentas", 
        header: "Cuentas Incluidas", 
        size: 250,
        Cell: ({ cell }) => {
          const cuentasRaw = cell.getValue<any>();
          const arr = parseCuentas(cuentasRaw);
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {arr.map((c, i) => (
                <div key={i} style={{ fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600 }}>{c.plataforma}</span>: {c.email} ({c.perfiles_alquilados} perf.)
                </div>
              ))}
            </div>
          );
        }
      },
      { accessorKey: "metodo_pago", header: "Método Pago", size: 120 },
      { 
        accessorKey: "fecha_inicio", 
        header: "Inicio", 
        size: 100,
        Cell: ({ cell }) => cell.getValue<string>()?.split("T")[0]
      },
      { 
        accessorKey: "fecha_vencimiento", 
        header: "Vencimiento", 
        size: 100,
        Cell: ({ cell }) => cell.getValue<string>()?.split("T")[0]
      },
      {
        accessorKey: "precio_total",
        header: "P. Total",
        size: 80,
        Cell: ({ cell }) => <strong>{`S/ ${Number(cell.getValue<number>()).toFixed(2)}`}</strong>,
      },
      {
        accessorKey: "estado_pagado",
        header: "Estado",
        size: 100,
        Cell: ({ cell }) => {
          const val = Number(cell.getValue<number>());
          const cls = val === 1 ? "badge badge--success" : "badge badge--warning";
          return <span className={cls}>{val === 1 ? "Pagado" : "Pendiente"}</span>;
        },
      },
    ],
    []
  );

  const exportarExcel = () => {
    const datosExport = datosFiltrados.map((c) => {
      const arr = parseCuentas(c.cuentas);
      const plataformas = arr.map(x => x.plataforma).join(", ");
      const correos = arr.map(x => x.email).join(", ");
      const totalPerf = arr.reduce((sum, x) => sum + Number(x.perfiles_alquilados), 0);

      return {
        "ID": c.id_contrato, 
        "Cliente": c.cliente, 
        "Tipo": c.tipo_contrato || "Directo",
        "Plataformas": plataformas,
        "Cuentas": correos,
        "Total Perfiles": totalPerf,
        "Método Pago": c.metodo_pago,
        "Fecha Inicio": c.fecha_inicio.split("T")[0],
        "Fecha Vencimiento": c.fecha_vencimiento.split("T")[0], 
        "Precio Total": c.precio_total, 
        "Estado": c.estado_pagado === 1 ? "Pagado" : "Pendiente",
      };
    });
    const ws = XLSX.utils.json_to_sheet(datosExport);
    const wb = XLSX.utils.book_new();
    const nombreHoja = mesSeleccionado === "todos"
      ? `Contratos_${anioSeleccionado}`
      : `${MESES[mesSeleccionado]}_${anioSeleccionado}`;
    XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
    XLSX.writeFile(wb, `Reporte_Contratos_${nombreHoja}.xlsx`);
  };

  const aniosDisponibles = useMemo(() => {
    if (data.length === 0) return [new Date().getFullYear()];
    const anios = new Set(data.map((c) => new Date(c.fecha_inicio).getFullYear()));
    return Array.from(anios).sort();
  }, [data]);

  return (
    <>
      <div className="contratos-page">
        <div className="contratos-page__header">
          <div className="period-filter">
            <Filter size={18} className="period-filter__icon" />
            <select
              className="period-filter__select"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              style={{ fontWeight: 600, color: filtroTipo === "Lank" ? "#3b82f6" : "#475569" }}
            >
              <option value="Todos">Todos los Contratos</option>
              <option value="Directo">Contratos Directos</option>
              <option value="Lank">Contratos Lank</option>
            </select>

            <Calendar size={18} className="period-filter__icon" style={{ marginLeft: '10px' }} />
            <select
              className="period-filter__select"
              value={anioSeleccionado}
              onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
            >
              {aniosDisponibles.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <select
              className="period-filter__select"
              value={mesSeleccionado === "todos" ? "todos" : mesSeleccionado}
              onChange={(e) => {
                const val = e.target.value;
                setMesSeleccionado(val === "todos" ? "todos" : Number(val));
              }}
            >
              <option value="todos">Todos los meses</option>
              {MESES.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          </div>
          <button className="btn-export" onClick={exportarExcel}>
            <Download size={16} />
            Exportar Excel
          </button>
        </div>

        <div className="metrics-grid">
          <div className="metric-card metric-card--primary">
            <span className="metric-card__label">Total Contratos</span>
            <span className="metric-card__value">{metricas.totalContratos}</span>
          </div>
          <div className="metric-card metric-card--success">
            <span className="metric-card__label">Ingresos</span>
            <span className="metric-card__value">S/ {metricas.totalIngresos.toFixed(2)}</span>
          </div>
          <div className="metric-card metric-card--info">
            <span className="metric-card__label">Pagados</span>
            <span className="metric-card__value">{metricas.pagados}</span>
          </div>
          <div className="metric-card metric-card--warning">
            <span className="metric-card__label">Pendientes</span>
            <span className="metric-card__value">{metricas.pendientes}</span>
          </div>
          <div className="metric-card metric-card--violet">
            <span className="metric-card__label">Perfiles Vendidos</span>
            <span className="metric-card__value">{metricas.totalPerfiles}</span>
          </div>
        </div>

        <DataTable<Contrato>
          columns={columns}
          data={datosFiltrados}
          isLoading={loading}
          onAdd={openCreate}
          onEdit={openEdit}
          onDelete={openDelete}
        />
      </div>

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Editar Contrato" : "Nuevo Contrato"}
        icon={<FileText size={20} />}
        size="lg"
        footer={
          <div className="modal-footer-actions">
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave}>
              <Save size={16} />
              {editItem ? "Actualizar" : "Guardar"}
            </button>
          </div>
        }
      >
        <div style={{ background: '#f8fafc', padding: '10px 15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ margin: 0, color: '#1e293b' }}>Modo Lank Farm</h4>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Activa esto si el contrato pertenece a la Granja de Lank (Precio S/ 0, Pago Automático).</p>
          </div>
          <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
            <input 
              type="checkbox" 
              name="tipo_contrato" 
              checked={form.tipo_contrato === "Lank"} 
              onChange={handleChange} 
              style={{ opacity: 0, width: 0, height: 0 }} 
            />
            <span className="slider round" style={{ 
              position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
              backgroundColor: form.tipo_contrato === "Lank" ? '#3b82f6' : '#ccc', 
              transition: '.4s', borderRadius: '24px' 
            }}>
              <span style={{
                position: 'absolute', content: '""', height: '16px', width: '16px', left: '4px', bottom: '4px',
                backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                transform: form.tipo_contrato === "Lank" ? 'translateX(26px)' : 'translateX(0)'
              }}></span>
            </span>
          </label>
        </div>

        <div className="form-grid">
          <FormCombobox
            label="Cliente"
            name="id_cliente"
            value={form.id_cliente}
            onChange={handleComboboxChange}
            options={clientes.filter(c => c.tipo === form.tipo_contrato)}
            placeholder="Buscar cliente..."
            searchPlaceholder="Escribe el nombre del cliente..."
            required
          />
          <FormSelect
            label="Método de pago"
            name="id_metodo"
            value={form.id_metodo}
            onChange={handleChange}
            options={metodosPago}
            placeholder="Seleccionar método..."
            required
          />
          <FormInput
            label="Fecha de inicio"
            name="fecha_inicio"
            type="date"
            value={form.fecha_inicio}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Fecha de vencimiento"
            name="fecha_vencimiento"
            type="date"
            value={form.fecha_vencimiento}
            onChange={handleChange}
            required
          />
          
          {form.tipo_contrato !== "Lank" && (
            <>
              <FormInput
                label="Precio por perfil (S/)"
                name="precio_unitario"
                type="number"
                value={form.precio_unitario}
                onChange={handleChange}
                step={0.50}
                min={0}
                placeholder="0.00"
                required
              />
              <FormSelect
                label="Estado de pago"
                name="estado_pagado"
                value={form.estado_pagado}
                onChange={handleChange}
                options={ESTADO_PAGO_OPT}
                required
              />
            </>
          )}
        </div>

        <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1rem' }}>Cuentas del Contrato</h4>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={addDetalle}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px' }}
            >
              <Plus size={14} /> Añadir Cuenta
            </button>
          </div>

          {form.detalles.map((detalle: any, index: number) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 100px auto', gap: '10px', alignItems: 'end', marginBottom: '10px' }}>
              <FormCombobox
                label={`Cuenta #${index + 1}`}
                name={`id_cuenta_${index}`}
                value={detalle.id_cuenta}
                onChange={(_, val) => handleDetalleChange(index, "id_cuenta", val)}
                options={cuentas.filter((c: any) => c.estado !== 'Caída' || c.value === Number(detalle.id_cuenta))}
                placeholder="Buscar cuenta..."
                searchPlaceholder="Escribe el email..."
                required
              />
              <FormInput
                label="Perfiles"
                name={`perfiles_${index}`}
                type="number"
                value={detalle.perfiles_alquilados}
                onChange={(e) => handleDetalleChange(index, "perfiles_alquilados", e.target.value)}
                min={1}
                max={7}
                required
              />
              <button 
                type="button" 
                onClick={() => removeDetalle(index)}
                style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', height: '38px', marginBottom: '4px' }}
                title="Eliminar cuenta"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </FormModal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        message={`¿Estás seguro de eliminar el contrato #${deleteItem?.id_contrato} de "${deleteItem?.cliente}"? Los perfiles serán liberados automáticamente.`}
      />
    </>
  );
};

export default ContratosPage;