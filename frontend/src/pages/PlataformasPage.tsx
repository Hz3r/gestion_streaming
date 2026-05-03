import { useMemo, useState, useEffect } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";
import FormModal from "../components/common/FormModal";
import FormInput from "../components/common/FormInput";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { Tv, Save } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { parseError } from "../utils/errorParser";
import { getPlataformas, createPlataforma, updatePlataforma, deletePlataforma } from "../services/dashboardService";

type Plataforma = {
  id_plataforma: number;
  nombre: string;
};

const INITIAL_FORM = { nombre: "" };

const PlataformasPage = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<Plataforma[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Plataforma | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Plataforma | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getPlataformas();
      setData(res.data);
    } catch (error) {
      console.error("Error al cargar plataformas:", error);
      showToast("Error al cargar plataformas", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openCreate = () => {
    setEditItem(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  };

  const openEdit = (item: Plataforma) => {
    setEditItem(item);
    setForm({ nombre: item.nombre });
    setModalOpen(true);
  };

  const openDelete = (item: Plataforma) => {
    setDeleteItem(item);
    setConfirmOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        await updatePlataforma(editItem.id_plataforma, form);
        showToast("Plataforma actualizada", "success");
      } else {
        await createPlataforma(form);
        showToast("Plataforma creada con éxito", "success");
      }
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error al guardar plataforma:", error);
      showToast(parseError(error), "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deletePlataforma(deleteItem.id_plataforma);
      showToast("Plataforma eliminada", "success");
      setConfirmOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error al eliminar plataforma:", error);
      showToast(parseError(error), "error");
    }
  };

  const columns = useMemo<MRT_ColumnDef<Plataforma>[]>(
    () => [
      { 
        accessorKey: "id_plataforma", 
        header: "#", 
        size: 80,
        Cell: ({ row }) => row.index + 1
      },
      { accessorKey: "nombre", header: "Nombre", size: 300 },
    ],
    []
  );

  return (
    <>
      <DataTable<Plataforma>
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
        title={editItem ? "Editar Plataforma" : "Nueva Plataforma"}
        icon={<Tv size={20} />}
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
            label="Nombre de la plataforma"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Netflix, Disney+, Spotify..."
            required
          />
        </div>
      </FormModal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        message={`¿Estás seguro de eliminar la plataforma "${deleteItem?.nombre}"? Esta acción no se puede deshacer.`}
      />
    </>
  );
};

export default PlataformasPage;