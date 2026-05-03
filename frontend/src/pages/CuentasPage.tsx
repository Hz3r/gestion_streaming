import { useMemo, useState, useEffect } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";
import FormModal from "../components/common/FormModal";
import FormInput from "../components/common/FormInput";
import FormSelect from "../components/common/FormSelect";
import FormCombobox from "../components/common/FormCombobox";
import FormSwitch from "../components/common/FormSwitch";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { Users, Save } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { parseError } from "../utils/errorParser";
import { formatFullDate } from "../utils/dateUtils";
import { 
  getCuentas, createCuenta, updateCuenta, deleteCuenta, 
  getPlataformas, getProveedores 
} from "../services/dashboardService";

type Cuenta = {
  id_cuenta: number;
  email: string;
  contraseña: string;
  fecha_compra: string;
  fecha_expiracion: string;
  id_plataforma: number;
  plataforma: string;
  id_proveedor: number;
  proveedor: string;
  estado: string;
  capacidad_total: number;
  perfiles_en_uso: number;
  costo_total: number;
  meses_duracion: number;
  es_lank?: boolean;
};

const INITIAL_FORM = {
  email: "", contraseña: "", fecha_compra: "", fecha_expiracion: "",
  id_plataforma: "", id_proveedor: "", estado: "Activa", capacidad_total: "4",
  costo_total: "0", meses_duracion: "1", es_lank: false
};

const ESTADOS_OPT = [
  { value: "Activa", label: "Activa" },
  { value: "Renovada", label: "Renovada" },
  { value: "Caída", label: "Caída" },
];

const CuentasPage = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [plataformas, setPlataformas] = useState<{value: any, label: string}[]>([]);
  const [proveedores, setProveedores] = useState<{value: any, label: string}[]>([]);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Cuenta | null>(null);
  const [form, setForm] = useState<any>(INITIAL_FORM);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Cuenta | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [resCuentas, resPlat, resProv] = await Promise.all([
        getCuentas(),
        getPlataformas(),
        getProveedores()
      ]);
      setData(resCuentas.data);
      setPlataformas(resPlat.data.map((p: any) => ({ value: p.id_plataforma, label: p.nombre })));
      setProveedores(resProv.data.map((p: any) => ({ value: p.id_proveedor, label: p.nombre })));
    } catch (error) {
      console.error("Error al cargar datos de cuentas:", error);
      showToast("Error al cargar datos de cuentas", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleComboboxChange = (name: string, value: string | number) => {
    setForm({ ...form, [name]: value });
  };

  const openCreate = () => { setEditItem(null); setForm(INITIAL_FORM); setModalOpen(true); };
  const openEdit = (item: Cuenta) => {
    setEditItem(item);
    setForm({
      email: item.email, 
      contraseña: item.contraseña,
      fecha_compra: item.fecha_compra.split("T")[0],
      fecha_expiracion: item.fecha_expiracion.split("T")[0], 
      id_plataforma: item.id_plataforma,
      id_proveedor: item.id_proveedor, 
      estado: item.estado, 
      capacidad_total: String(item.capacidad_total),
      costo_total: String(item.costo_total),
      meses_duracion: String(item.meses_duracion),
      es_lank: item.es_lank || false
    });
    setModalOpen(true);
  };
  const openDelete = (item: Cuenta) => { setDeleteItem(item); setConfirmOpen(true); };

  const handleSave = async () => {
    try {
      // VALIDACIÓN DE FECHAS
      if (form.fecha_expiracion < form.fecha_compra) {
        showToast("La fecha de expiración no puede ser anterior a la de compra", "error");
        return;
      }

      const dataToSend = {
        ...form,
        capacidad_total: Number(form.capacidad_total),
        costo_total: Number(form.costo_total),
        meses_duracion: Number(form.meses_duracion),
        es_lank: Boolean(form.es_lank)
      };

      if (editItem) {
        await updateCuenta(editItem.id_cuenta, dataToSend);
        showToast("Cuenta actualizada correctamente", "success");
      } else {
        await createCuenta(dataToSend);
        showToast("Cuenta creada con éxito", "success");
      }
      setModalOpen(false);
      fetchInitialData();
    } catch (error: any) {
      console.error("Error al guardar cuenta:", error);
      showToast(parseError(error), "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteCuenta(deleteItem.id_cuenta);
      showToast("Cuenta eliminada", "success");
      setConfirmOpen(false);
      fetchInitialData();
    } catch (error: any) {
      console.error("Error al eliminar cuenta:", error);
      showToast(parseError(error), "error");
    }
  };

  const columns = useMemo<MRT_ColumnDef<Cuenta>[]>(
    () => [
      { 
        accessorKey: "id_cuenta", 
        header: "#", 
        size: 60,
        Cell: ({ row }) => row.index + 1
      },
      { accessorKey: "email", header: "Email", size: 200 },
      { 
        accessorKey: "plataforma", 
        header: "Plataforma", 
        size: 110,
        Cell: ({ row, cell }) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{cell.getValue<string>()}</span>
            {row.original.es_lank && <span className="badge badge--warning">Lank</span>}
          </div>
        )
      },
      {
        accessorKey: "estado",
        header: "Estado",
        size: 100,
        Cell: ({ cell }) => {
          const val = cell.getValue<string>();
          const cls =
            val === "Activa" ? "badge badge--success" :
            val === "Renovada" ? "badge badge--warning" :
            "badge badge--error";
          return <span className={cls}>{val}</span>;
        },
      },
      {
        accessorKey: "costo_total",
        header: "Costo",
        size: 90,
        Cell: ({ cell }) => `S/ ${Number(cell.getValue<number>()).toFixed(2)}`
      },
      {
        accessorKey: "meses_duracion",
        header: "Duración",
        size: 90,
        Cell: ({ cell }) => `${cell.getValue()} mes(es)`
      },
      {
        accessorKey: "perfiles_en_uso",
        header: "Uso",
        size: 100,
        Cell: ({ row }) => {
          const enUso = row.original.perfiles_en_uso;
          const total = row.original.capacidad_total;
          const pct = total > 0 ? (enUso / total) * 100 : 0;
          const color =
            pct >= 100 ? "var(--color-error-500)" :
            pct >= 75 ? "var(--color-warning-500)" :
            "var(--color-success-500)";
          return (
            <div className="stock-bar">
              <div className="stock-bar__track">
                <div className="stock-bar__fill" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
              </div>
              <span className="stock-bar__label">{enUso}/{total}</span>
            </div>
          );
        },
      },
      { 
        accessorKey: "fecha_expiracion", 
        header: "Expiración", 
        size: 160,
        Cell: ({ cell }) => (
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            {formatFullDate(cell.getValue<string>())}
          </span>
        )
      },
    ],
    []
  );

  return (
    <>
      <DataTable<Cuenta>
        columns={columns}
        data={data}
        isLoading={loading}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={openDelete}
        addPermission="cuentas:create"
        editPermission="cuentas:edit"
        deletePermission="cuentas:delete"
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Editar Cuenta" : "Nueva Cuenta"}
        icon={<Users size={20} />}
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
        <div className="form-grid">
          <FormInput
            label="Email de la cuenta"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="cuenta@plataforma.com"
            required
          />
          <FormInput
            label="Contraseña"
            name="contraseña"
            type="password"
            value={form.contraseña}
            onChange={handleChange}
            placeholder="Contraseña de la cuenta"
            required
          />
          <FormCombobox
            label="Plataforma"
            name="id_plataforma"
            value={form.id_plataforma}
            onChange={handleComboboxChange}
            options={plataformas}
            placeholder="Buscar plataforma..."
            required
          />
          <FormCombobox
            label="Proveedor"
            name="id_proveedor"
            value={form.id_proveedor}
            onChange={handleComboboxChange}
            options={proveedores}
            placeholder="Buscar proveedor..."
            required
          />
          <FormInput
            label="Fecha de compra"
            name="fecha_compra"
            type="date"
            value={form.fecha_compra}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Fecha de expiración"
            name="fecha_expiracion"
            type="date"
            value={form.fecha_expiracion}
            onChange={handleChange}
            required
          />
          <FormSelect
            label="Estado"
            name="estado"
            value={form.estado}
            onChange={handleChange}
            options={ESTADOS_OPT}
            required
          />
          <FormInput
            label="Capacidad total"
            name="capacidad_total"
            type="number"
            value={form.capacidad_total}
            onChange={handleChange}
            min={1}
            required
          />
          <FormInput
            label="Costo Total de Inversión"
            name="costo_total"
            type="number"
            value={form.costo_total}
            onChange={handleChange}
            placeholder="Ej: 75.00"
            required
          />
          <FormInput
            label="Duración (Meses)"
            name="meses_duracion"
            type="number"
            value={form.meses_duracion}
            onChange={handleChange}
            min={1}
            required
          />
          <FormSwitch
            label="¿Es Cuenta de Lank?"
            name="es_lank"
            checked={form.es_lank}
            onChange={(val) => setForm({ ...form, es_lank: val })}
            description="Las inversiones de esta cuenta se asignarán al módulo Lank."
          />
        </div>
      </FormModal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        message={`¿Estás seguro de eliminar la cuenta "${deleteItem?.email}"?`}
      />
    </>
  );
};

export default CuentasPage;