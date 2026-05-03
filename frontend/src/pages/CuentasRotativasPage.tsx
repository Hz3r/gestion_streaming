import { useMemo, useState, useEffect } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";
import FormModal from "../components/common/FormModal";
import FormInput from "../components/common/FormInput";
import { getCuentas, updateCuenta, getRotativaPorCuenta, createRotativa, updateRotativa, getHistorialCredenciales } from "../services/dashboardService";
import { RefreshCw, History, AlertTriangle, Users } from "lucide-react";
import { differenceInHours, parseISO } from "date-fns";

type Cuenta = {
  id_cuenta: number;
  email: string;
  contraseña: string;
  plataforma: string;
  estado: string;
  perfiles_en_uso: number;
};

const CuentasRotativasPage = () => {
  const [data, setData] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [historialOpen, setHistorialOpen] = useState(false);
  
  const [editItem, setEditItem] = useState<Cuenta | null>(null);
  const [rotativaData, setRotativaData] = useState<any>(null);
  const [historial, setHistorial] = useState<any[]>([]);

  const [form, setForm] = useState({
    email: "", contraseña: "", fecha_cancelacion_requerida: "", estado_vigencia: "Activo"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getCuentas();
      // Solo mostramos cuentas que podrían ser rotativas (o todas para elegir)
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
        fecha_cancelacion_requerida: rot?.fecha_cancelacion_requerida ? rot.fecha_cancelacion_requerida.split("T")[0] : "",
        estado_vigencia: rot?.estado_vigencia || "Activo"
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
      // 1. Actualizar email/pass en la tabla cuentas (esto disparará el historial en el backend)
      if (editItem && (editItem.email !== form.email || editItem.contraseña !== form.contraseña)) {
        await updateCuenta(editItem.id_cuenta, {
          ...editItem, // mandamos el resto igual
          email: form.email,
          contraseña: form.contraseña
        });
      }

      // 2. Actualizar o crear metadata rotativa
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
    } catch (error) {
      console.error(error);
      alert("Error guardando credenciales rotativas");
    }
  };

  const columns = useMemo<MRT_ColumnDef<Cuenta>[]>(() => [
    { accessorKey: "id_cuenta", header: "ID", size: 60 },
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
        enableRowActions={false} // Usamos la columna personalizada
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
        <div className="alert-box" style={{ background: '#eff6ff', color: '#1e40af', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <strong><Users size={16} style={{verticalAlign: 'sub'}}/> Clientes asociados: {editItem?.perfiles_en_uso}</strong>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem' }}>Recuerda notificar a estos clientes sobre el cambio de credenciales.</p>
        </div>

        <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <FormInput label="Email Nuevo/Actual" name="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
          <FormInput label="Contraseña Nueva/Actual" name="contraseña" value={form.contraseña} onChange={(e) => setForm({...form, contraseña: e.target.value})} required />
          
          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
            <FormInput 
              label="Fecha de Cancelación Requerida (Evitar cobro)" 
              name="fecha_cancelacion_requerida" 
              type="date" 
              value={form.fecha_cancelacion_requerida} 
              onChange={(e) => setForm({...form, fecha_cancelacion_requerida: e.target.value})} 
            />
            {form.fecha_cancelacion_requerida && differenceInHours(parseISO(form.fecha_cancelacion_requerida), new Date()) <= 24 && differenceInHours(parseISO(form.fecha_cancelacion_requerida), new Date()) >= 0 && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <AlertTriangle size={14}/> ¡Atención! Menos de 24h para cancelar la suscripción.
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
