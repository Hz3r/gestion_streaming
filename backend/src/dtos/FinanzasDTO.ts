// Resumen financiero mensual (incluye egresos)
export interface FinanzasResumenDTO {
    readonly mes: number;
    readonly anio: number;
    readonly ingresos_reales: number;
    readonly ingresos_pendientes: number;
    readonly ingresos_proyectados: number;
    readonly inversiones: number;
    readonly gastos_perdidas: number;
    readonly utilidad_neta: number;
}

export interface FinanzasPendienteDetalle {
    readonly email_cuenta: string;
    readonly nombre_plataforma: string;
    readonly perfiles_alquilados: number;
}

// Detalle de un contrato pendiente (para el click en "Pendientes")
export interface FinanzasPendienteDTO {
    readonly id_contrato: number;
    readonly nombre_cliente: string;
    readonly fecha_inicio: Date;
    readonly fecha_vencimiento: Date;
    readonly precio_total: number;
    readonly detalles: FinanzasPendienteDetalle[];
}
