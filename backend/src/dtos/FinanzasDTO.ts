// Resumen financiero mensual (viene de la vista SQL)
interface FinanzasResumenDTO {
    readonly mes: number;
    readonly anio: number;
    readonly ingresos_reales: number;
    readonly ingresos_pendientes: number;
    readonly ingresos_proyectados: number;
}

// Detalle de un contrato pendiente (para el click en "Pendientes")
interface FinanzasPendienteDTO {
    readonly id_contrato: number;
    readonly nombre_cliente: string;
    readonly email_cuenta: string;
    readonly nombre_plataforma: string;
    readonly perfiles_alquilados: number;
    readonly fecha_inicio: Date;
    readonly fecha_vencimiento: Date;
    readonly precio_total: number;
}

export type { FinanzasResumenDTO, FinanzasPendienteDTO };
