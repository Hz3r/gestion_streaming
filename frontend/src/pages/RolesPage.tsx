import { useMemo, useState, useEffect } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";
import FormModal from "../components/common/FormModal";
import FormInput from "../components/common/FormInput";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { Shield, Save } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { parseError } from "../utils/errorParser";
import { getRoles, createRol, updateRol, deleteRol } from "../services/dashboardService";

type Rol = {
  id_rol: number;
  nombre: string;
  permisos?: string[];
};

import { PERMISOS, GRUPOS_PERMISOS } from "../constants/Permisos";

const INITIAL_FORM = { nombre: "", permisos: [] as string[] };

const RolesPage = () => {
  const { showToast } = useToast();
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
      showToast("Error al cargar roles", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openCreate = () => { setEditItem(null); setForm(INITIAL_FORM); setModalOpen(true); };
  const openEdit = (item: Rol) => { 
    // Primero preparamos los datos de forma segura
    let permisosArray: string[] = [];
    try {
        if (Array.isArray(item.permisos)) {
            permisosArray = [...item.permisos];
        } else if (typeof item.permisos === 'string' && item.permisos) {
            permisosArray = JSON.parse(item.permisos);
        }
    } catch (e) {
        console.error("Error parsing permisos:", e);
        permisosArray = [];
    }

    setEditItem(item);
    setForm({ 
      nombre: item.nombre, 
      permisos: permisosArray
    }); 
    
    setModalOpen(true); 
  };
  const openDelete = (item: Rol) => { setDeleteItem(item); setConfirmOpen(true); };

  const handleTogglePermiso = (permiso: string) => {
    const current = [...form.permisos];
    if (current.includes(permiso)) {
      setForm({ ...form, permisos: current.filter(p => p !== permiso) });
    } else {
      setForm({ ...form, permisos: [...current, permiso] });
    }
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        await updateRol(editItem.id_rol, form);
        showToast("Rol actualizado", "success");
      } else {
        await createRol(form);
        showToast("Rol creado con éxito", "success");
      }
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error al guardar rol:", error);
      showToast(error.response?.data?.message || "Error al guardar el rol", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteRol(deleteItem.id_rol);
      showToast("Rol eliminado", "success");
      setConfirmOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error al eliminar rol:", error);
      showToast(error.response?.data?.message || "Error al eliminar el rol", "error");
    }
  };

  const columns = useMemo<MRT_ColumnDef<Rol>[]>(
    () => [
      { 
        accessorKey: "id_rol", 
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
      <DataTable<Rol>
        columns={columns}
        data={data}
        isLoading={loading}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={openDelete}
        addPermission="roles:manage"
        editPermission="roles:manage"
        deletePermission="roles:manage"
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
        <div key={editItem ? editItem.id_rol : 'new'} className="form-grid--single">
          <FormInput
            label="Nombre del rol"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Administrador, Operador..."
            required
          />

          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Permisos del Rol</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxHeight: '400px', overflowY: 'auto', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              {GRUPOS_PERMISOS.map(grupo => (
                <div key={grupo.nombre} style={{ marginBottom: '1rem' }}>
                  <h5 style={{ borderBottom: '1px solid #eee', marginBottom: '0.5rem', paddingBottom: '0.2rem', color: '#1e293b' }}>{grupo.nombre}</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {Object.values(PERMISOS).filter(p => {
                        const regex = new RegExp(grupo.prefijo);
                        return regex.test(p) && p !== 'all';
                    }).map(permiso => (
                      <label key={permiso} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={form.permisos.includes(permiso)} 
                          onChange={() => handleTogglePermiso(permiso)}
                        />
                        {permiso.split(':')[1].toUpperCase()}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ gridColumn: 'span 2', marginTop: '1rem', borderTop: '2px dashed #eee', paddingTop: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: '#ef4444' }}>
                   <input 
                    type="checkbox" 
                    checked={form.permisos.includes('all')} 
                    onChange={() => handleTogglePermiso('all')}
                  />
                  ACCESO TOTAL (SUPERADMIN)
                </label>
              </div>
            </div>
          </div>
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