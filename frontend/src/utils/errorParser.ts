/**
 * Traduce errores técnicos de base de datos o sistema a lenguaje humano.
 */
export const parseError = (error: any): string => {
  const message = error.response?.data?.message || error.message || String(error);

  // --- Errores de Duplicidad ---
  if (message.includes("Duplicate entry")) {
    if (message.includes("email")) return "Este correo electrónico ya está registrado.";
    if (message.includes("nombre")) return "Ya existe un registro con este nombre.";
    return "Este registro ya existe en el sistema.";
  }

  // --- Errores de Integridad Referencial (Foreign Keys) ---
  if (message.includes("foreign key constraint fails")) {
    return "No se puede eliminar este registro porque está siendo utilizado en otro módulo.";
  }

  // --- Errores de Validación de Datos ---
  if (message.includes("Data too long")) {
    return "El texto es demasiado largo. Por favor, redúcelo.";
  }

  if (message.includes("Incorrect date value")) {
    return "El formato de fecha no es válido.";
  }

  // --- Errores de Autenticación ---
  if (error.response?.status === 401) {
    return "Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.";
  }

  if (error.response?.status === 403) {
    return "No tienes permisos suficientes para realizar esta acción.";
  }

  // Si no se encuentra un patrón, devolver el mensaje original (o uno genérico si es muy críptico)
  return message.length > 100 ? "Ocurrió un error inesperado en el servidor." : message;
};
