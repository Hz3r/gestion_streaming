import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";

type Usuario = {
  id_usuario: number;
  nombre: string;
  contraseña: string;
  rol: string;
};

const MOCK_DATA: Usuario[] = [
  { id_usuario: 1, nombre: "Admin Principal", contraseña: "****", rol: "Administrador" },
  { id_usuario: 2, nombre: "Pedro Sánchez", contraseña: "****", rol: "Operador" },
];

const UsuariosPage = () => {
  const columns = useMemo<MRT_ColumnDef<Usuario>[]>(
    () => [
      { accessorKey: "id_usuario", header: "ID", size: 80 },
      { accessorKey: "nombre", header: "Nombre", size: 200 },
      { accessorKey: "contraseña", header: "Contraseña", size: 120 },
      { accessorKey: "rol", header: "Rol", size: 150 },
    ],
    []
  );

  return (
    <DataTable<Usuario>
      columns={columns}
      data={MOCK_DATA}
      onAdd={() => console.log("Agregar usuario")}
      onEdit={(u) => console.log("Editar:", u)}
      onDelete={(u) => console.log("Eliminar:", u)}
    />
  );
};

export default UsuariosPage;