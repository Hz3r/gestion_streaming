import { TipoEgreso } from "../models/Egresos";

interface EgresosDTO {
    id_egreso?: number;
    monto: number;
    tipo_egreso: TipoEgreso;
    descripcion: string | null;
    fecha_gasto: string | Date; // Cambiado de fecha_egreso a fecha_gasto
    id_cuenta: number | null;
    email_cuenta?: string;
}

export default EgresosDTO;
