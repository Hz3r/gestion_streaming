import { useMemo, useState, useEffect } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";
import FormModal from "../components/common/FormModal";
import FormInput from "../components/common/FormInput";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { Shield, Save } from "lucide-react";
import { getRoles, createRol, updateRol, deleteRol } from "../services/dashboardService";

type Rol = {
  id_rol: number;
  nombre: string;
};

const INITIAL_FORM = { nombre: "" };

const RolesPage = () => {
  const [data, setData] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Rol | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Rol | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getRoles();
      setData(res.data);
    } catch (error) {
      console.error("Error al cargar roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openCreate = () => { setEditItem(null); setForm(INITIAL_FORM); setModalOpen(true); };
  const openEdit = (item: Rol) => { setEditItem(item); setForm({ nombre: item.nombre }); setModalOpen(true); };
  const openDelete = (item: Rol) => { setDeleteItem(item); setConfirmOpen(true); };

  const handleSave = async () => {
    try {
      if (editItem) {
        await updateRol(editItem.id_rol, form);
      } else {
        await createRol(form);
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error al guardar rol:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteRol(deleteItem.id_rol);
      setConfirmOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error al eliminar rol:", error);
    }
  };

  const columns = useMemo<MRT_ColumnDef<Rol>[]>(
    () => [
      { accessorKey: "id_rol", header: "ID", size: 80 },
      { accessorKey: "nombre", header: "Nombre", size: 300 },
    ],
    []
  );

  return (
    <>
      <DataTable<Rol>
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
        title={editItem ? "Editar Rol" : "Nuevo Rol"}
        icon={<Shield size={20} />}
        size="sm"
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
        <div className="form-grid--single">
          <FormInput
            label="Nombre del rol"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Administrador, Operador..."
            required
          />
        </div>
      </FormModal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        message={`¿Estás seguro de eliminar el rol "${deleteItem?.nombre}"?`}
      />
    </>
  );
};

export default RolesPage;