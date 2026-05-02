import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";

type Rol = {
  id_rol: number;
  nombre: string;
};

const MOCK_DATA: Rol[] = [
  { id_rol: 1, nombre: "Administrador" },
  { id_rol: 2, nombre: "Operador" },
  { id_rol: 3, nombre: "Cliente" },
];

const RolesPage = () => {
  const columns = useMemo<MRT_ColumnDef<Rol>[]>(
    () => [
      { accessorKey: "id_rol", header: "ID", size: 80 },
      { accessorKey: "nombre", header: "Nombre", size: 300 },
    ],
    []
  );

  return (
    <DataTable<Rol>
      columns={columns}
      data={MOCK_DATA}
      onAdd={() => console.log("Agregar rol")}
      onEdit={(r) => console.log("Editar:", r)}
      onDelete={(r) => console.log("Eliminar:", r)}
    />
  );
};

export default RolesPage;