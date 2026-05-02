import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";

type Cuenta = {
  id_cuenta: number;
  email: string;
  contraseña: string;
  fecha_compra: string;
  fecha_expiracion: string;
  plataforma: string;
  proveedor: string;
  estado: string;
};

const MOCK_DATA: Cuenta[] = [
  { id_cuenta: 1, email: "netflix_premium@mail.com", contraseña: "****", fecha_compra: "2025-01-15", fecha_expiracion: "2025-07-15", plataforma: "Netflix", proveedor: "DistroTV", estado: "Activa" },
  { id_cuenta: 2, email: "disney_family@mail.com", contraseña: "****", fecha_compra: "2025-02-10", fecha_expiracion: "2025-08-10", plataforma: "Disney+", proveedor: "StreamPro", estado: "Activa" },
  { id_cuenta: 3, email: "hbo_user01@mail.com", contraseña: "****", fecha_compra: "2025-03-05", fecha_expiracion: "2025-09-05", plataforma: "HBO Max", proveedor: "DistroTV", estado: "Renovada" },
  { id_cuenta: 4, email: "spotify_music@mail.com", contraseña: "****", fecha_compra: "2024-12-20", fecha_expiracion: "2025-06-20", plataforma: "Spotify", proveedor: "MusicWorld", estado: "Caída" },
  { id_cuenta: 5, email: "prime_video@mail.com", contraseña: "****", fecha_compra: "2025-04-01", fecha_expiracion: "2025-10-01", plataforma: "Amazon Prime", proveedor: "StreamPro", estado: "Activa" },
];

const CuentasPage = () => {
  const columns = useMemo<MRT_ColumnDef<Cuenta>[]>(
    () => [
      { accessorKey: "id_cuenta", header: "ID", size: 60 },
      { accessorKey: "email", header: "Email", size: 200 },
      { accessorKey: "fecha_compra", header: "F. Compra", size: 120 },
      { accessorKey: "fecha_expiracion", header: "F. Expiración", size: 120 },
      { accessorKey: "plataforma", header: "Plataforma", size: 120 },
      { accessorKey: "proveedor", header: "Proveedor", size: 120 },
      { accessorKey: "estado", header: "Estado", size: 100 },
    ],
    []
  );

  return (
    <DataTable<Cuenta>
      columns={columns}
      data={MOCK_DATA}
      onAdd={() => console.log("Agregar cuenta")}
      onEdit={(c) => console.log("Editar:", c)}
      onDelete={(c) => console.log("Eliminar:", c)}
    />
  );
};

export default CuentasPage;