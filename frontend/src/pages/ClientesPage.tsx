import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";

type Cliente = {
  id_cliente: number;
  nombre: string;
  telefono: string;
  estado: string;
};

const MOCK_DATA: Cliente[] = [
  { id_cliente: 1, nombre: "Carlos Mendoza", telefono: "987654321", estado: "Activo" },
  { id_cliente: 2, nombre: "María López", telefono: "912345678", estado: "Activo" },
  { id_cliente: 3, nombre: "José García", telefono: "956789012", estado: "Inactivo" },
  { id_cliente: 4, nombre: "Ana Torres", telefono: "934567890", estado: "Activo" },
  { id_cliente: 5, nombre: "Luis Ramírez", telefono: "976543210", estado: "Activo" },
  { id_cliente: 6, nombre: "Sofía Vargas", telefono: "945678123", estado: "Moroso" },
];

const ClientesPage = () => {
  const columns = useMemo<MRT_ColumnDef<Cliente>[]>(
    () => [
      { accessorKey: "id_cliente", header: "ID", size: 80 },
      { accessorKey: "nombre", header: "Nombre", size: 220 },
      { accessorKey: "telefono", header: "Teléfono", size: 150 },
      { accessorKey: "estado", header: "Estado", size: 120 },
    ],
    []
  );

  return (
    <DataTable<Cliente>
      columns={columns}
      data={MOCK_DATA}
      onAdd={() => console.log("Agregar cliente")}
      onEdit={(c) => console.log("Editar:", c)}
      onDelete={(c) => console.log("Eliminar:", c)}
    />
  );
};

export default ClientesPage;