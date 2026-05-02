export type TipoEgreso = 'Inversion_Cuenta' | 'Gasto_Operativo' | 'Perdida_Baneo' | 'Pago_Staff';

interface Egresos {
    id_egreso?: number;
    monto: number;
    tipo_egreso: TipoEgreso;
    descripcion: string | null;
    fecha_gasto: Date | string; // Cambiado de fecha_egreso a fecha_gasto
    id_cuenta: number | null;
}

export default Egresos;
