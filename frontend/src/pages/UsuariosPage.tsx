import { useMemo, useState, useEffect } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";
import FormModal from "../components/common/FormModal";
import FormInput from "../components/common/FormInput";
import FormSelect from "../components/common/FormSelect";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { User, Save } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { parseError } from "../utils/errorParser";
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, getRoles } from "../services/dashboardService";

type Usuario = {
  id_usuario: number;
  nombre: string;
  contraseña: string;
  id_rol: number;
  rol: string;
};

const INITIAL_FORM = { nombre: "", contraseña: "", id_rol: "" };

const UsuariosPage = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<{value: any, label: string}[]>([]);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Usuario | null>(null);
  const [form, setForm] = useState<any>(INITIAL_FORM);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Usuario | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [resUsers, resRoles] = await Promise.all([
        getUsuarios(),
        getRoles()
      ]);
      setData(resUsers.data);
      setRoles(resRoles.data.map((r: any) => ({ value: r.id_rol, label: r.nombre })));
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      showToast("Error al cargar datos de usuarios", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openCreate = () => { setEditItem(null); setForm(INITIAL_FORM); setModalOpen(true); };
  const openEdit = (item: Usuario) => {
    setEditItem(item);
    setForm({ nombre: item.nombre, contraseña: "", id_rol: item.id_rol });
    setModalOpen(true);
  };
  const openDelete = (item: Usuario) => { setDeleteItem(item); setConfirmOpen(true); };

  const handleSave = async () => {
    try {
      if (editItem) {
        await updateUsuario(editItem.id_usuario, form);
        showToast("Usuario actualizado", "success");
      } else {
        await createUsuario(form);
        showToast("Usuario creado con éxito", "success");
      }
      setModalOpen(false);
      fetchInitialData();
    } catch (error: any) {
      console.error("Error al guardar usuario:", error);
      showToast(parseError(error), "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteUsuario(deleteItem.id_usuario);
      showToast("Usuario eliminado", "success");
      setConfirmOpen(false);
      fetchInitialData();
    } catch (error: any) {
      console.error("Error al eliminar usuario:", error);
      showToast(parseError(error), "error");
    }
  };

  const columns = useMemo<MRT_ColumnDef<Usuario>[]>(
    () => [
      { 
        accessorKey: "id_usuario", 
        header: "#", 
        size: 80,
        Cell: ({ row }) => row.index + 1
      },
      { accessorKey: "nombre", header: "Nombre", size: 200 },
      { accessorKey: "contraseña", header: "Contraseña", size: 120, Cell: () => "****" },
      {
        accessorKey: "rol",
        header: "Rol",
        size: 150,
        Cell: ({ cell }) => {
          const val = cell.getValue<string>();
          const cls = val === "Administrador" ? "badge badge--info" : "badge badge--success";
          return <span className={cls}>{val}</span>;
        },
      },
    ],
    []
  );

  return (
    <>
      <DataTable<Usuario>
        columns={columns}
        data={data}
        isLoading={loading}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={openDelete}
        addPermission="usuarios:manage"
        editPermission="usuarios:manage"
        deletePermission="usuarios:manage"
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Editar Usuario" : "Nuevo Usuario"}
        icon={<User size={20} />}
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
            placeholder="Nombre del usuario"
            required
          />
          <FormInput
            label={editItem ? "Nueva contraseña" : "Contraseña"}
            name="contraseña"
            type="password"
            value={form.contraseña}
            onChange={handleChange}
            placeholder={editItem ? "Dejar vacío para no cambiar" : "Contraseña segura"}
            required={!editItem}
          />
          <FormSelect
            label="Rol"
            name="id_rol"
            value={form.id_rol}
            onChange={handleChange}
            options={roles}
            placeholder="Seleccionar rol..."
            required
          />
        </div>
      </FormModal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        message={`¿Estás seguro de eliminar al usuario "${deleteItem?.nombre}"?`}
      />
    </>
  );
};

export default UsuariosPage;