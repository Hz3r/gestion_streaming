import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";

type Proveedor = {
  id_proveedor: number;
  nombre: string;
  url_contacto: string;
  reputacion: string;
};

const MOCK_DATA: Proveedor[] = [
  { id_proveedor: 1, nombre: "DistroTV", url_contacto: "https://distrotv.com", reputacion: "Excelente" },
  { id_proveedor: 2, nombre: "StreamPro", url_contacto: "https://streampro.pe", reputacion: "Buena" },
  { id_proveedor: 3, nombre: "MusicWorld", url_contacto: "https://musicworld.net", reputacion: "Regular" },
  { id_proveedor: 4, nombre: "CuentasFlex", url_contacto: "https://cuentasflex.com", reputacion: "Excelente" },
  { id_proveedor: 5, nombre: "MegaStream", url_contacto: "https://megastream.io", reputacion: "Buena" },
];

const ProveedoresPage = () => {
  const columns = useMemo<MRT_ColumnDef<Proveedor>[]>(
    () => [
      { accessorKey: "id_proveedor", header: "ID", size: 80 },
      { accessorKey: "nombre", header: "Nombre", size: 180 },
      { accessorKey: "url_contacto", header: "Contacto", size: 220 },
      { accessorKey: "reputacion", header: "Reputación", size: 120 },
    ],
    []
  );

  return (
    <DataTable<Proveedor>
      columns={columns}
      data={MOCK_DATA}
      onAdd={() => console.log("Agregar proveedor")}
      onEdit={(p) => console.log("Editar:", p)}
      onDelete={(p) => console.log("Eliminar:", p)}
    />
  );
};

export default ProveedoresPage;