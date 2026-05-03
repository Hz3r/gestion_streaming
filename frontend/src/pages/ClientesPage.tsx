import { useMemo, useState, useEffect } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";
import FormModal from "../components/common/FormModal";
import FormInput from "../components/common/FormInput";
import FormSelect from "../components/common/FormSelect";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { UserCheck, Save } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { parseError } from "../utils/errorParser";
import { getClientes, createCliente, updateCliente, deleteCliente } from "../services/dashboardService";

type Cliente = {
  id_cliente: number;
  nombre: string;
  telefono: string;
  estado: string;
  tipo: string;
};

const INITIAL_FORM = { nombre: "", telefono: "", estado: "Activo", tipo: "Directo" };

const ESTADOS = [
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
  { value: "Moroso", label: "Moroso" },
];

const TIPOS = [
  { value: "Directo", label: "Directo" },
  { value: "Lank", label: "Lank" },
];

const ClientesPage = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Cliente | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Cliente | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getClientes();
      setData(res.data);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      showToast("Error al cargar la lista de clientes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openCreate = () => { setEditItem(null); setForm(INITIAL_FORM); setModalOpen(true); };
  const openEdit = (item: Cliente) => {
    setEditItem(item);
    setForm({ nombre: item.nombre, telefono: item.telefono, estado: item.estado, tipo: item.tipo || "Directo" });
    setModalOpen(true);
  };
  const openDelete = (item: Cliente) => { setDeleteItem(item); setConfirmOpen(true); };

  const handleSave = async () => {
    try {
      if (editItem) {
        await updateCliente(editItem.id_cliente, form);
        showToast("Cliente actualizado correctamente", "success");
      } else {
        await createCliente(form);
        showToast("Cliente creado con éxito", "success");
      }
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error al guardar cliente:", error);
      showToast(parseError(error), "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteCliente(deleteItem.id_cliente);
      showToast("Cliente eliminado", "success");
      setConfirmOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error al eliminar cliente:", error);
      showToast(parseError(error), "error");
    }
  };

  const columns = useMemo<MRT_ColumnDef<Cliente>[]>(
    () => [
      { 
        accessorKey: "id_cliente", 
        header: "#", 
        size: 80,
        Cell: ({ row }) => row.index + 1
      },
      { accessorKey: "nombre", header: "Nombre", size: 220 },
      { accessorKey: "telefono", header: "Teléfono", size: 150 },
      {
        accessorKey: "tipo",
        header: "Tipo",
        size: 100,
        Cell: ({ cell }) => {
          const val = cell.getValue<string>();
          const cls = val === "Lank" ? "badge badge--info" : "badge badge--warning";
          return <span className={cls}>{val || "Directo"}</span>;
        }
      },
      {
        accessorKey: "estado",
        header: "Estado",
        size: 120,
        Cell: ({ cell }) => {
          const val = cell.getValue<string>();
          const cls =
            val === "Activo" ? "badge badge--success" :
            val === "Moroso" ? "badge badge--error" :
            "badge badge--warning";
          return <span className={cls}>{val}</span>;
        },
      },
    ],
    []
  );

  return (
    <>
      <DataTable<Cliente>
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
        title={editItem ? "Editar Cliente" : "Nuevo Cliente"}
        icon={<UserCheck size={20} />}
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
            label="Nombre completo"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Carlos Mendoza"
            required
          />
          <FormInput
            label="Teléfono"
            name="telefono"
            type="tel"
            value={form.telefono}
            onChange={handleChange}
            placeholder="Ej: 987654321"
            required
          />
          <FormSelect
            label="Tipo"
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            options={TIPOS}
            required
          />
          <FormSelect
            label="Estado"
            name="estado"
            value={form.estado}
            onChange={handleChange}
            options={ESTADOS}
            required
          />
        </div>
      </FormModal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        message={`¿Estás seguro de eliminar al cliente "${deleteItem?.nombre}"?`}
      />
    </>
  );
};

export default ClientesPage;