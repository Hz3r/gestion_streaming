import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../components/common/DataTable";

type Contrato = {
  id_contrato: number;
  cliente: string;
  cuenta: string;
  metodo_pago: string;
  perfiles_alquilados: number;
  fecha_inicio: string;
  fecha_vencimiento: string;
  precio_unitario: number;
  precio_total: number;
  estado_pagado: string;
};

const MOCK_DATA: Contrato[] = [
  { id_contrato: 1, cliente: "Carlos Mendoza", cuenta: "netflix_premium@mail.com", metodo_pago: "Yape", perfiles_alquilados: 2, fecha_inicio: "2025-01-15", fecha_vencimiento: "2025-07-15", precio_unitario: 5.00, precio_total: 10.00, estado_pagado: "Pagado" },
  { id_contrato: 2, cliente: "María López", cuenta: "disney_family@mail.com", metodo_pago: "Plin", perfiles_alquilados: 1, fecha_inicio: "2025-02-10", fecha_vencimiento: "2025-08-10", precio_unitario: 6.50, precio_total: 6.50, estado_pagado: "Pagado" },
  { id_contrato: 3, cliente: "José García", cuenta: "hbo_user01@mail.com", metodo_pago: "Efectivo", perfiles_alquilados: 3, fecha_inicio: "2025-03-05", fecha_vencimiento: "2025-09-05", precio_unitario: 4.00, precio_total: 12.00, estado_pagado: "Pendiente" },
  { id_contrato: 4, cliente: "Ana Torres", cuenta: "spotify_music@mail.com", metodo_pago: "Transferencia Bancaria", perfiles_alquilados: 1, fecha_inicio: "2025-04-01", fecha_vencimiento: "2025-10-01", precio_unitario: 3.50, precio_total: 3.50, estado_pagado: "Pagado" },
  { id_contrato: 5, cliente: "Luis Ramírez", cuenta: "prime_video@mail.com", metodo_pago: "PayPal", perfiles_alquilados: 2, fecha_inicio: "2025-03-20", fecha_vencimiento: "2025-09-20", precio_unitario: 4.50, precio_total: 9.00, estado_pagado: "Pendiente" },
];

const ContratosPage = () => {
  const columns = useMemo<MRT_ColumnDef<Contrato>[]>(
    () => [
      { accessorKey: "id_contrato", header: "ID", size: 60 },
      { accessorKey: "cliente", header: "Cliente", size: 150 },
      { accessorKey: "cuenta", header: "Cuenta", size: 200 },
      { accessorKey: "metodo_pago", header: "Método Pago", size: 140 },
      { accessorKey: "perfiles_alquilados", header: "Perfiles", size: 80 },
      { accessorKey: "fecha_inicio", header: "Inicio", size: 110 },
      { accessorKey: "fecha_vencimiento", header: "Vencimiento", size: 110 },
      { accessorKey: "precio_unitario", header: "P. Unit.", size: 80 },
      { accessorKey: "precio_total", header: "P. Total", size: 80 },
      { accessorKey: "estado_pagado", header: "Estado", size: 100 },
    ],
    []
  );

  return (
    <DataTable<Contrato>
      columns={columns}
      data={MOCK_DATA}
      onAdd={() => console.log("Agregar contrato")}
      onEdit={(c) => console.log("Editar:", c)}
      onDelete={(c) => console.log("Eliminar:", c)}
    />
  );
};

export default ContratosPage;