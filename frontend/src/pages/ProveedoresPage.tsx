import { useMemo, useState, useEffect } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";
import FormModal from "../components/common/FormModal";
import FormInput from "../components/common/FormInput";
import FormSelect from "../components/common/FormSelect";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { Truck, Save } from "lucide-react";
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from "../services/dashboardService";

type Proveedor = {
  id_proveedor: number;
  nombre: string;
  url_contacto: string;
  reputacion: string;
};

const INITIAL_FORM = { nombre: "", url_contacto: "", reputacion: "Buena" };

const REPUTACIONES = [
  { value: "Excelente", label: "Excelente" },
  { value: "Buena", label: "Buena" },
  { value: "Regular", label: "Regular" },
  { value: "Mala", label: "Mala" },
];

const ProveedoresPage = () => {
  const [data, setData] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Proveedor | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Proveedor | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getProveedores();
      setData(res.data);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openCreate = () => { setEditItem(null); setForm(INITIAL_FORM); setModalOpen(true); };
  const openEdit = (item: Proveedor) => {
    setEditItem(item);
    setForm({ nombre: item.nombre, url_contacto: item.url_contacto, reputacion: item.reputacion });
    setModalOpen(true);
  };
  const openDelete = (item: Proveedor) => { setDeleteItem(item); setConfirmOpen(true); };

  const handleSave = async () => {
    try {
      if (editItem) {
        await updateProveedor(editItem.id_proveedor, form);
      } else {
        await createProveedor(form);
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error al guardar proveedor:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteProveedor(deleteItem.id_proveedor);
      setConfirmOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error al eliminar proveedor:", error);
    }
  };

  const columns = useMemo<MRT_ColumnDef<Proveedor>[]>(
    () => [
      { accessorKey: "id_proveedor", header: "ID", size: 80 },
      { accessorKey: "nombre", header: "Nombre", size: 180 },
      {
        accessorKey: "url_contacto",
        header: "Contacto",
        size: 220,
        Cell: ({ cell }) => {
          const url = cell.getValue<string>();
          return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="table-link">
              {url}
            </a>
          );
        },
      },
      {
        accessorKey: "reputacion",
        header: "Reputación",
        size: 120,
        Cell: ({ cell }) => {
          const val = cell.getValue<string>();
          const cls =
            val === "Excelente" ? "badge badge--success" :
            val === "Buena" ? "badge badge--info" :
            val === "Mala" ? "badge badge--error" :
            "badge badge--warning";
          return <span className={cls}>{val}</span>;
        },
      },
    ],
    []
  );

  return (
    <>
      <DataTable<Proveedor>
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
        title={editItem ? "Editar Proveedor" : "Nuevo Proveedor"}
        icon={<Truck size={20} />}
        size="md"
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
            label="Nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: DistroTV"
            required
          />
          <FormInput
            label="URL de contacto"
            name="url_contacto"
            type="url"
            value={form.url_contacto}
            onChange={handleChange}
            placeholder="https://ejemplo.com"
            required
          />
          <FormSelect
            label="Reputación"
            name="reputacion"
            value={form.reputacion}
            onChange={handleChange}
            options={REPUTACIONES}
            required
          />
        </div>
      </FormModal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        message={`¿Estás seguro de eliminar al proveedor "${deleteItem?.nombre}"?`}
      />
    </>
  );
};

export default ProveedoresPage;