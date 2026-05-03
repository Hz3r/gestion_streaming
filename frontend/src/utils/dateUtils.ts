import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Formatea una fecha ISO a un formato largo en español: "17 de mayo del 2026"
 * @param dateString Fecha en formato ISO o string compatible
 * @returns Fecha formateada o el mismo string si es inválido
 */
export const formatFullDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "Sin fecha";
  
  const date = parseISO(dateString);
  
  if (!isValid(date)) {
    // Intentar como objeto Date si no es ISO
    const dateObj = new Date(dateString);
    if (!isValid(dateObj)) return dateString;
    return format(dateObj, "d 'de' MMMM 'del' yyyy", { locale: es });
  }

  return format(date, "d 'de' MMMM 'del' yyyy", { locale: es });
};
