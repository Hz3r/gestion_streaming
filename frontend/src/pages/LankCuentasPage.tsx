import { useMemo, useState, useEffect } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";
import FormModal from "../components/common/FormModal";
import FormInput from "../components/common/FormInput";
import FormSelect from "../components/common/FormSelect";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { getLankCuentas, createLankCuenta, updateLankCuenta, deleteLankCuenta, getPlataformas } from "../services/dashboardService";
import { Server, ShieldAlert, CheckCircle } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

type LankCuenta = {
  id_lank_madre: number;
  correo: string;
  password?: string;
  metodo_acceso: string;
  numero_vinculado?: string;
  verificado: number;
  yape_numero?: string;
  monto_farming: number;
  bono_activo: number;
  estado_baneo: string;
  fecha_desbaneo?: string;
  plataformas_activas: any;
  fecha_creacion: string;
};

const BONO_CANTIDAD = 94.40;
const PLATAFORMAS_REQUERIDAS_COUNT = 10;

const INITIAL_FORM = {
  correo: "", password: "", metodo_acceso: "Manual", numero_vinculado: "",
  verificado: "0", yape_numero: "", monto_farming: 0, bono_activo: "0",
  estado_baneo: "Limpio", fecha_desbaneo: "", plataformas_activas: []
};

const LankCuentasPage = () => {
  const [data, setData] = useState<LankCuenta[]>([]);
  const [plataformasRegistradas, setPlataformasRegistradas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<LankCuenta | null>(null);
  const [form, setForm] = useState<any>(INITIAL_FORM);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<LankCuenta | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resLank, resPlat] = await Promise.all([
        getLankCuentas(),
        getPlataformas()
      ]);
      setData(resLank.data);
      // Obtener solo los nombres de las plataformas para el checklist
      setPlataformasRegistradas(resPlat.data.map((p: any) => p.nombre));
    } catch (error) {
      console.error("Error fetching Lank data:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditItem(null); setForm(INITIAL_FORM); setModalOpen(true); };
  
  const openEdit = (item: LankCuenta) => {
    setEditItem(item);
    let plataformas = [];
    try {
      plataformas = typeof item.plataformas_activas === "string" ? JSON.parse(item.plataformas_activas) : (item.plataformas_activas || []);
    } catch (e) { plataformas = []; }

    setForm({
      correo: item.correo,
      password: item.password || "",
      metodo_acceso: item.metodo_acceso,
      numero_vinculado: item.numero_vinculado || "",
      verificado: String(item.verificado),
      yape_numero: item.yape_numero || "",
      monto_farming: item.monto_farming,
      bono_activo: String(item.bono_activo),
      estado_baneo: item.estado_baneo,
      fecha_desbaneo: item.fecha_desbaneo ? item.fecha_desbaneo.split("T")[0] : "",
      plataformas_activas: plataformas
    });
    setModalOpen(true);
  };

  const handleCheckboxChange = (plat: string) => {
    const act = [...form.plataformas_activas];
    if (act.includes(plat)) {
      setForm({ ...form, plataformas_activas: act.filter(p => p !== plat) });
    } else {
      setForm({ ...form, plataformas_activas: [...act, plat] });
    }
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      // Calcular Bono
      const activas = form.plataformas_activas.length;
      const aplicaBono = activas >= PLATAFORMAS_REQUERIDAS_COUNT;
      
      // Guardar SOLO EL MONTO BASE/EXTRA. No sumar el bono al campo en DB.
      const montoBaseOExtra = Number(form.monto_farming);

      const payload = {
        ...form,
        verificado: Number(form.verificado),
        bono_activo: aplicaBono ? 1 : 0,
        monto_farming: montoBaseOExtra,
        fecha_desbaneo: form.estado_baneo === "Limpio" ? null : form.fecha_desbaneo || null
      };

      if (editItem) {
        await updateLankCuenta(editItem.id_lank_madre, payload);
      } else {
        await createLankCuenta(payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Error guardando la cuenta Lank");
    }
  };

  const columns = useMemo<MRT_ColumnDef<LankCuenta>[]>(() => [
    { accessorKey: "id_lank_madre", header: "ID", size: 60 },
    { accessorKey: "correo", header: "Correo Madre", size: 200 },
    {
      accessorKey: "estado_baneo",
      header: "Estado",
      size: 150,
      Cell: ({ row }) => {
        const estado = row.original.estado_baneo;
        if (estado === "Limpio") {
          return <span className="badge badge--success"><CheckCircle size={14} style={{marginRight:4}} /> Limpio</span>;
        }
        const fecha = row.original.fecha_desbaneo ? parseISO(row.original.fecha_desbaneo) : null;
        let countdown = "";
        if (fecha) {
          const dias = differenceInDays(fecha, new Date());
          countdown = dias > 0 ? ` (Faltan ${dias} d)` : " (Desbaneo hoy)";
        }
        return <span className="badge badge--error"><ShieldAlert size={14} style={{marginRight:4}} /> Baneado {countdown}</span>;
      }
    },
    {
      accessorKey: "plataformas_activas",
      header: "Checklist Plataformas",
      size: 250,
      Cell: ({ cell }) => {
        let p = [];
        try { p = typeof cell.getValue() === "string" ? JSON.parse(cell.getValue<string>()) : (cell.getValue() || []); } catch { p = []; }
        
        const tieneBono = p.length >= PLATAFORMAS_REQUERIDAS_COUNT;
        
        return (
          <div style={{ fontSize: "0.85rem" }}>
            <div style={{ color: tieneBono ? "#10b981" : "#f59e0b", fontWeight: 600 }}>
              {p.length} / {PLATAFORMAS_REQUERIDAS_COUNT} Activas
            </div>
            {!tieneBono && <div style={{ color: "#64748b" }}>Faltan {PLATAFORMAS_REQUERIDAS_COUNT - p.length} para el bono</div>}
            {tieneBono && <div style={{ color: "#10b981" }}>¡Bono Completo! (+S/ {BONO_CANTIDAD})</div>}
          </div>
        );
      }
    },
    {
      accessorKey: "monto_farming",
      header: "Monto Farmeado",
      size: 150,
      Cell: ({ row }) => {
        const extra = Number(row.original.monto_farming) || 0;
        const bono = row.original.bono_activo === 1 ? BONO_CANTIDAD : 0;
        const total = extra + bono;
        return (
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <strong style={{fontSize: '1rem'}}>S/ {total.toFixed(2)}</strong>
            <span style={{fontSize: '0.75rem', color: '#64748b'}}>
              (Base/Extra: {extra} | Bono: {bono})
            </span>
          </div>
        );
      }
    }
  ], []);

  return (
    <div className="lank-page">
      <DataTable<LankCuenta>
        columns={columns}
        data={data}
        isLoading={loading}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={(item) => { setDeleteItem(item); setConfirmOpen(true); }}
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Editar Cuenta Madre Lank" : "Nueva Cuenta Madre Lank"}
        icon={<Server size={20} />}
        size="lg"
        footer={
          <div className="modal-footer-actions">
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave}>Guardar</button>
          </div>
        }
      >
        <div className="form-grid">
          <FormInput label="Correo Madre" name="correo" value={form.correo} onChange={handleChange} required />
          <FormInput label="Contraseña" name="password" value={form.password} onChange={handleChange} />
          <FormSelect label="Método de Acceso" name="metodo_acceso" value={form.metodo_acceso} onChange={handleChange} options={[{value:"Manual",label:"Manual"},{value:"Google",label:"Google"}]} />
          <FormInput label="Número Vinculado" name="numero_vinculado" value={form.numero_vinculado} onChange={handleChange} />
          <FormSelect label="Verificado en Lank" name="verificado" value={form.verificado} onChange={handleChange} options={[{value:"1",label:"Sí"},{value:"0",label:"No"}]} />
          <FormInput label="Yape Asignado" name="yape_numero" value={form.yape_numero} onChange={handleChange} />
          <FormInput label="Monto Base / Extras (S/)" name="monto_farming" type="number" step="0.1" value={form.monto_farming} onChange={handleChange} />
          
          <FormSelect label="Estado de Baneo" name="estado_baneo" value={form.estado_baneo} onChange={handleChange} options={[{value:"Limpio",label:"Limpio"},{value:"Baneado",label:"Baneado"}]} />
          {form.estado_baneo === "Baneado" && (
            <FormInput label="Fecha de Desbaneo Estimada" name="fecha_desbaneo" type="date" value={form.fecha_desbaneo} onChange={handleChange} />
          )}
        </div>

        <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
          <h4>Checklist de Plataformas Activas</h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '15px' }}>Si completas {PLATAFORMAS_REQUERIDAS_COUNT} plataformas, se sumará el bono de S/ {BONO_CANTIDAD}.</p>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {plataformasRegistradas.map(p => (
              <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: '#f1f5f9', padding: '8px 15px', borderRadius: '8px' }}>
                <input type="checkbox" checked={form.plataformas_activas.includes(p)} onChange={() => handleCheckboxChange(p)} style={{ width: '18px', height: '18px' }} />
                <span>{p}</span>
              </label>
            ))}
          </div>
        </div>
      </FormModal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={async () => {
          if(deleteItem) {
            await deleteLankCuenta(deleteItem.id_lank_madre);
            setConfirmOpen(false);
            fetchData();
          }
        }}
        message={`¿Estás seguro de eliminar la cuenta Lank de ${deleteItem?.correo}?`}
      />
    </div>
  );
};

export default LankCuentasPage;
