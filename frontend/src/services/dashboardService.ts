import api from "./api";

// ─── PLATAFORMAS ───
export const getPlataformas = () => api.get("/plataformas");
export const createPlataforma = (data: any) => api.post("/plataformas", data);
export const updatePlataforma = (id: number, data: any) => api.put(`/plataformas/${id}`, data);
export const deletePlataforma = (id: number) => api.delete(`/plataformas/${id}`);

// ─── CLIENTES ───
export const getClientes = () => api.get("/clientes");
export const createCliente = (data: any) => api.post("/clientes", data);
export const updateCliente = (id: number, data: any) => api.put(`/clientes/${id}`, data);
export const deleteCliente = (id: number) => api.delete(`/clientes/${id}`);

// ─── PROVEEDORES ───
export const getProveedores = () => api.get("/proveedores");
export const createProveedor = (data: any) => api.post("/proveedores", data);
export const updateProveedor = (id: number, data: any) => api.put(`/proveedores/${id}`, data);
export const deleteProveedor = (id: number) => api.delete(`/proveedores/${id}`);

// ─── METODOS DE PAGO ───
export const getMetodosPago = () => api.get("/metodos_pago");
export const createMetodoPago = (data: any) => api.post("/metodos_pago", data);
export const updateMetodoPago = (id: number, data: any) => api.put(`/metodos_pago/${id}`, data);
export const deleteMetodoPago = (id: number) => api.delete(`/metodos_pago/${id}`);

// ─── CUENTAS ───
export const getCuentas = () => api.get("/cuentas");
export const createCuenta = (data: any) => api.post("/cuentas", data);
export const updateCuenta = (id: number, data: any) => api.put(`/cuentas/${id}`, data);
export const deleteCuenta = (id: number) => api.delete(`/cuentas/${id}`);

// ─── CONTRATOS ───
export const getContratos = () => api.get("/contratos/detalle");
export const createContrato = (data: any) => api.post("/contratos", data);
export const updateContrato = (id: number, data: any) => api.put(`/contratos/${id}`, data);
export const deleteContrato = (id: number) => api.delete(`/contratos/${id}`);

// ─── FINANZAS ───
export const getResumenGeneral = () => api.get("/finanzas/resumen");
export const getResumenAnual = (anio: number) => api.get(`/finanzas/resumen/${anio}`);
export const getPendientesMensual = (mes: number, anio: number) => api.get(`/finanzas/pendientes/${anio}/${mes}`);

// ─── USUARIOS / ROLES ───
export const getUsuarios = () => api.get("/usuarios");
export const createUsuario = (data: any) => api.post("/usuarios", data);
export const updateUsuario = (id: number, data: any) => api.put(`/usuarios/${id}`, data);
export const deleteUsuario = (id: number) => api.delete(`/usuarios/${id}`);
export const getRoles = () => api.get("/roles");
export const createRol = (data: any) => api.post("/roles", data);
export const updateRol = (id: number, data: any) => api.put(`/roles/${id}`, data);
export const deleteRol = (id: number) => api.delete(`/roles/${id}`);

export const updatePerfil = (id: number, data: any) => api.put(`/usuarios/perfil/${id}`, data);
export const updatePassword = (id: number, data: any) => api.put(`/usuarios/password/${id}`, data);

// ─── CONFIGURACION ───
export const getConfiguracion = () => api.get("/configuracion");
export const updateConfiguracion = (data: any) => api.put("/configuracion", data);

// ─── NOTIFICACIONES ───
export const getNotificaciones = (id_usuario: number) => api.get(`/notificaciones/usuario/${id_usuario}`);
export const marcarNotificacionLeida = (id: number) => api.put(`/notificaciones/${id}/leer`);
export const marcarTodasLeidas = (id_usuario: number) => api.put(`/notificaciones/usuario/${id_usuario}/leer-todas`);
