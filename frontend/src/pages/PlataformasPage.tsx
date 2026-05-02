// src/pages/PlataformasPage.tsx
import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";
// ─── Tipo de dato ───
// Define la forma de una Plataforma (más adelante vendrá de tu API)
type Plataforma = {
  id: number;
  nombre: string;
  max_perfiles: number;
};
// ─── Datos de prueba (mock) ───
const MOCK_DATA: Plataforma[] = [
  { id: 1, nombre: "Netflix", max_perfiles: 5 },
  { id: 2, nombre: "Disney+", max_perfiles: 4 },
  { id: 3, nombre: "HBO Max", max_perfiles: 3 },
  { id: 4, nombre: "Spotify", max_perfiles: 3 },
  { id: 5, nombre: "Amazon Prime", max_perfiles: 4 },
];
const PlataformasPage = () => {
  // ─── Definir columnas (memoizadas) ───
  const columns = useMemo<MRT_ColumnDef<Plataforma>[]>(
    () => [
      { accessorKey: "id", header: "ID", size: 60, sortable: true, filterFn: 'equals' },
      { accessorKey: "nombre", header: "Nombre", size: 300, sortable: true, filterFn: 'contains' },
      { accessorKey: "max_perfiles", header: "Max Perfiles", size: 300, sortable: true, filterFn: 'between' },
    ],
    []
  );
  // ─── Handlers de acciones ───
  const handleAdd = () => {
    console.log("Agregar nueva plataforma");
  };
  const handleEdit = (plataforma: Plataforma) => {
    console.log("Editar:", plataforma);
  };
  const handleDelete = (plataforma: Plataforma) => {
    console.log("Eliminar:", plataforma);
  };
  return (
    <DataTable<Plataforma>
      title=""
      columns={columns}
      data={MOCK_DATA}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
};
export default PlataformasPage;