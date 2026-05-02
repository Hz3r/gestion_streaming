import { useMemo, useState, useEffect } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";
import FormModal from "../components/common/FormModal";
import FormInput from "../components/common/FormInput";
import FormSelect from "../components/common/FormSelect";
import FormCombobox from "../components/common/FormCombobox";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { Users, Save } from "lucide-react";
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
};

const INITIAL_FORM = {
  email: "", contraseña: "", fecha_compra: "", fecha_expiracion: "",
  id_plataforma: "", id_proveedor: "", estado: "Activa", capacidad_total: "4",
};

const ESTADOS_OPT = [
  { value: "Activa", label: "Activa" },
  { value: "Renovada", label: "Renovada" },
  { value: "Caída", label: "Caída" },
];

const CuentasPage = () => {
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
      contraseña: item.contraseña, // Cargar contraseña existente
      fecha_compra: item.fecha_compra.split("T")[0],
      fecha_expiracion: item.fecha_expiracion.split("T")[0], 
      id_plataforma: item.id_plataforma,
      id_proveedor: item.id_proveedor, 
      estado: item.estado, 
      capacidad_total: String(item.capacidad_total),
    });
    setModalOpen(true);
  };
  const openDelete = (item: Cuenta) => { setDeleteItem(item); setConfirmOpen(true); };

  const handleSave = async () => {
    try {
      if (editItem) {
        await updateCuenta(editItem.id_cuenta, form);
      } else {
        await createCuenta(form);
      }
      setModalOpen(false);
      fetchInitialData();
    } catch (error) {
      console.error("Error al guardar cuenta:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteCuenta(deleteItem.id_cuenta);
      setConfirmOpen(false);
      fetchInitialData();
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
    }
  };

  const columns = useMemo<MRT_ColumnDef<Cuenta>[]>(
    () => [
      { accessorKey: "id_cuenta", header: "ID", size: 60 },
      { accessorKey: "email", header: "Email", size: 200 },
      { 
        accessorKey: "fecha_compra", 
        header: "F. Compra", 
        size: 110,
        Cell: ({ cell }) => cell.getValue<string>()?.split("T")[0]
      },
      { 
        accessorKey: "fecha_expiracion", 
        header: "F. Expiración", 
        size: 110,
        Cell: ({ cell }) => cell.getValue<string>()?.split("T")[0]
      },
      { accessorKey: "plataforma", header: "Plataforma", size: 110 },
      { accessorKey: "proveedor", header: "Proveedor", size: 110 },
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
      { accessorKey: "capacidad_total", header: "Capacidad", size: 90 },
      {
        accessorKey: "perfiles_en_uso",
        header: "En Uso",
        size: 90,
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
            searchPlaceholder="Ej: Netflix, HBO..."
            required
          />
          <FormCombobox
            label="Proveedor"
            name="id_proveedor"
            value={form.id_proveedor}
            onChange={handleComboboxChange}
            options={proveedores}
            placeholder="Buscar proveedor..."
            searchPlaceholder="Ej: DistroTV..."
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
            label="Capacidad total (perfiles)"
            name="capacidad_total"
            type="number"
            value={form.capacidad_total}
            onChange={handleChange}
            min={1}
            max={10}
            required
          />
        </div>
      </FormModal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        message={`¿Estás seguro de eliminar la cuenta "${deleteItem?.email}"? Los contratos asociados podrían verse afectados.`}
      />
    </>
  );
};

export default CuentasPage;