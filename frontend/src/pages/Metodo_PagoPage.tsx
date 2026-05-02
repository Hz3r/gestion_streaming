import { useMemo, useState, useEffect } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";
import FormModal from "../components/common/FormModal";
import FormInput from "../components/common/FormInput";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { CreditCard, Save } from "lucide-react";
import { getMetodosPago, createMetodoPago, updateMetodoPago, deleteMetodoPago } from "../services/dashboardService";

type MetodoPago = {
  id_metodo: number;
  nombre: string;
};

const INITIAL_FORM = { nombre: "" };

const MetodoPagoPage = () => {
  const [data, setData] = useState<MetodoPago[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<MetodoPago | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<MetodoPago | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMetodosPago();
      setData(res.data);
    } catch (error) {
      console.error("Error al cargar métodos de pago:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openCreate = () => { setEditItem(null); setForm(INITIAL_FORM); setModalOpen(true); };
  const openEdit = (item: MetodoPago) => { setEditItem(item); setForm({ nombre: item.nombre }); setModalOpen(true); };
  const openDelete = (item: MetodoPago) => { setDeleteItem(item); setConfirmOpen(true); };

  const handleSave = async () => {
    try {
      if (editItem) {
        await updateMetodoPago(editItem.id_metodo, form);
      } else {
        await createMetodoPago(form);
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error al guardar método de pago:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteMetodoPago(deleteItem.id_metodo);
      setConfirmOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error al eliminar método de pago:", error);
    }
  };

  const columns = useMemo<MRT_ColumnDef<MetodoPago>[]>(
    () => [
      { accessorKey: "id_metodo", header: "ID", size: 80 },
      { accessorKey: "nombre", header: "Nombre", size: 300 },
    ],
    []
  );

  return (
    <>
      <DataTable<MetodoPago>
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
        title={editItem ? "Editar Método de Pago" : "Nuevo Método de Pago"}
        icon={<CreditCard size={20} />}
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
            label="Nombre del método"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Yape, Plin, Transferencia..."
            required
          />
        </div>
      </FormModal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        message={`¿Estás seguro de eliminar el método "${deleteItem?.nombre}"?`}
      />
    </>
  );
};

export default MetodoPagoPage;