import { useMemo, useState, useEffect } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";
import FormModal from "../components/common/FormModal";
import FormInput from "../components/common/FormInput";
import { getCuentas, updateCuenta, getRotativaPorCuenta, createRotativa, updateRotativa, getHistorialCredenciales } from "../services/dashboardService";
import { useToast } from "../context/ToastContext";
import { parseError } from "../utils/errorParser";
import { RefreshCw, History, AlertTriangle, Users } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { formatFullDate } from "../utils/dateUtils";

type Cuenta = {
  id_cuenta: number;
  email: string;
  contraseña: string;
  plataforma: string;
  estado: string;
  perfiles_en_uso: number;
  fecha_compra?: string;
  fecha_expiracion?: string;
  fecha_cancelacion_requerida?: string;
};

const CuentasRotativasPage = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [historialOpen, setHistorialOpen] = useState(false);
  
  const [editItem, setEditItem] = useState<Cuenta | null>(null);
  const [rotativaData, setRotativaData] = useState<any>(null);
  const [historial, setHistorial] = useState<any[]>([]);

  const [form, setForm] = useState({
    email: "", 
    contraseña: "", 
    fecha_cancelacion_requerida: "", 
    estado_vigencia: "Activo",
    fecha_expiracion: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getCuentas();
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openGestion = async (item: Cuenta) => {
    setEditItem(item);
    try {
      const res = await getRotativaPorCuenta(item.id_cuenta);
      const rot = res.data;
      setRotativaData(rot && rot.id_rotativa ? rot : null);
      
      setForm({
        email: item.email,
        contraseña: item.contraseña,
        fecha_cancelacion_requerida: (rot?.fecha_cancelacion_requerida || item.fecha_expiracion)?.split("T")[0] || "",
        estado_vigencia: rot?.estado_vigencia || "Activo",
        fecha_expiracion: item.fecha_expiracion ? item.fecha_expiracion.split("T")[0] : ""
      });
      setModalOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  const openHistorial = async (item: Cuenta) => {
    setEditItem(item);
    try {
      const res = await getHistorialCredenciales(item.id_cuenta);
      setHistorial(res.data);
      setHistorialOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    try {
      // VALIDACIONES
      if (form.fecha_cancelacion_requerida) {
        const today = new Date().toISOString().split('T')[0];
        if (form.fecha_cancelacion_requerida < today) {
          showToast("La fecha de cancelación no puede ser una fecha pasada", "error");
          return;
        }
      }

      // Actualizar Cuenta (Credenciales + Fecha Sincronizada)
      if (editItem) {
        await updateCuenta(editItem.id_cuenta, {
          ...editItem,
          fecha_compra: editItem.fecha_compra ? editItem.fecha_compra.split("T")[0] : null,
          fecha_expiracion: form.fecha_cancelacion_requerida, // Sincronización total
          email: form.email,
          contraseña: form.contraseña
        });
      }

      // Actualizar o Crear Configuración Rotativa (Fecha de Cobro Sincronizada)
      if (form.fecha_cancelacion_requerida) {
        const payload = {
          id_cuenta_fija: editItem?.id_cuenta,
          fecha_cancelacion_requerida: form.fecha_cancelacion_requerida,
          estado_vigencia: form.estado_vigencia
        };
        if (rotativaData) {
          await updateRotativa(rotativaData.id_rotativa, payload);
        } else {
          await createRotativa(payload);
        }
      }

      setModalOpen(false);
      fetchData();
      showToast("Credenciales y fechas sincronizadas correctamente", "success");
    } catch (error: any) {
      console.error(error);
      showToast(parseError(error), "error");
    }
  };

  const columns = useMemo<MRT_ColumnDef<Cuenta>[]>(() => [
    { 
      accessorKey: "id_cuenta", 
      header: "#", 
      size: 60,
      Cell: ({ row }) => row.index + 1
    },
    { accessorKey: "plataforma", header: "Plataforma", size: 120 },
    { accessorKey: "email", header: "Email Actual", size: 200 },
    {
      accessorKey: "perfiles_en_uso",
      header: "Clientes Asociados",
      size: 150,
      Cell: ({ cell }) => (
        <span className="badge badge--info"><Users size={14} style={{marginRight:4}} /> {cell.getValue<number>()} clientes</span>
      )
    },
    {
      accessorKey: "fecha_expiracion",
      header: "Vencimiento / Próximo Cobro",
      size: 200,
      Cell: ({ cell }) => {
        const val = cell.getValue<string>();
        if (!val) return <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Sin fecha definida</span>;
        
        const fecha = parseISO(val);
        const diasRestantes = differenceInDays(fecha, new Date());
        let badge = null;
        
        if (diasRestantes < 0) {
          badge = <span className="badge badge--error"><AlertTriangle size={14} style={{marginRight:4}} /> Vencido</span>;
        } else if (diasRestantes === 0) {
          badge = <span className="badge badge--error"><AlertTriangle size={14} style={{marginRight:4}} /> ¡Vence HOY!</span>;
        } else if (diasRestantes <= 3) {
          badge = <span className="badge badge--error">En {diasRestantes} días</span>;
        } else if (diasRestantes <= 7) {
          badge = <span className="badge badge--warning">En {diasRestantes} días</span>;
        } else {
          badge = <span className="badge badge--success">En {diasRestantes} días</span>;
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {badge}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {formatFullDate(val)}
            </span>
          </div>
        );
      }
    },
    {
      id: "acciones_rotativas",
      header: "Gestión Rotativa",
      size: 200,
      Cell: ({ row }) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => openGestion(row.original)} style={{ padding: '5px 10px', fontSize: '0.8rem' }}>
            <RefreshCw size={14} style={{marginRight: 4}}/> Credenciales
          </button>
          <button className="btn-secondary" onClick={() => openHistorial(row.original)} style={{ padding: '5px 10px', fontSize: '0.8rem' }}>
            <History size={14} style={{marginRight: 4}}/> Historial
          </button>
        </div>
      )
    }
  ], []);

  return (
    <div className="rotativas-page">
      <DataTable<Cuenta>
        columns={columns}
        data={data}
        isLoading={loading}
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Gestión de Credenciales Rotativas"
        icon={<RefreshCw size={20} />}
        size="md"
        footer={
          <div className="modal-footer-actions">
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave}>Guardar Cambios</button>
          </div>
        }
      >
        <div className="alert-box" style={{ 
          background: 'var(--bg-secondary)', 
          color: 'var(--text-primary)', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px'
        }}>
          <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-info-500)' }}>
            <Users size={18}/> Clientes asociados: {editItem?.perfiles_en_uso}
          </strong>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Esta fecha se sincronizará automáticamente con el vencimiento de la cuenta.
          </p>
        </div>

        <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <FormInput label="Email Nuevo/Actual" name="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
          <FormInput label="Contraseña Nueva/Actual" name="contraseña" value={form.contraseña} onChange={(e) => setForm({...form, contraseña: e.target.value})} required />
          
          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
            <FormInput 
              label="Fecha de Vencimiento / Próximo Cobro" 
              name="fecha_cancelacion_requerida" 
              type="date" 
              value={form.fecha_cancelacion_requerida} 
              onChange={(e) => setForm({...form, fecha_cancelacion_requerida: e.target.value, fecha_expiracion: e.target.value})} 
            />
            {form.fecha_cancelacion_requerida && differenceInDays(parseISO(form.fecha_cancelacion_requerida), new Date()) <= 1 && differenceInDays(parseISO(form.fecha_cancelacion_requerida), new Date()) >= 0 && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <AlertTriangle size={14}/> ¡Atención! El cobro se realizará muy pronto (1 día o menos).
              </div>
            )}
          </div>
        </div>
      </FormModal>

      <FormModal
        isOpen={historialOpen}
        onClose={() => setHistorialOpen(false)}
        title="Historial de Credenciales"
        icon={<History size={20} />}
        size="lg"
      >
        {historial.length === 0 ? (
          <p>No hay cambios registrados para esta cuenta.</p>
        ) : (
          <table className="rt-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Email Anterior</th>
                <th>Email Nuevo</th>
                <th>Pass Anterior</th>
                <th>Pass Nuevo</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((h, i) => (
                <tr key={i}>
                  <td>{new Date(h.fecha_cambio).toLocaleString()}</td>
                  <td style={{ color: '#ef4444' }}>{h.email_anterior}</td>
                  <td style={{ color: '#10b981' }}>{h.email_nuevo}</td>
                  <td style={{ color: '#ef4444' }}>{h.pass_anterior}</td>
                  <td style={{ color: '#10b981' }}>{h.pass_nuevo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </FormModal>
    </div>
  );
};

export default CuentasRotativasPage;
