import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";

type MetodoPago = {
  id_metodo_pago: number;
  nombre: string;
};

const MOCK_DATA: MetodoPago[] = [
  { id_metodo_pago: 1, nombre: "Yape" },
  { id_metodo_pago: 2, nombre: "Plin" },
  { id_metodo_pago: 3, nombre: "Transferencia Bancaria" },
  { id_metodo_pago: 4, nombre: "Efectivo" },
  { id_metodo_pago: 5, nombre: "PayPal" },
];

const MetodoPagoPage = () => {
  const columns = useMemo<MRT_ColumnDef<MetodoPago>[]>(
    () => [
      { accessorKey: "id_metodo_pago", header: "ID", size: 80 },
      { accessorKey: "nombre", header: "Nombre", size: 300 },
    ],
    []
  );

  return (
    <DataTable<MetodoPago>
      columns={columns}
      data={MOCK_DATA}
      onAdd={() => console.log("Agregar método de pago")}
      onEdit={(m) => console.log("Editar:", m)}
      onDelete={(m) => console.log("Eliminar:", m)}
    />
  );
};

export default MetodoPagoPage;