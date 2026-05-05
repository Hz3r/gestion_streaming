import pool from "../config/db.js";
import { ConfiguracionDTO } from "../dtos/ConfiguracionDTO.js";

class ConfiguracionRepository {
    async obtenerConfiguracion(): Promise<ConfiguracionDTO> {
        const [rows] = await pool.execute('SELECT * FROM configuracion WHERE id = 1');
        return (rows as any)[0];
    }

    async actualizarConfiguracion(config: Partial<ConfiguracionDTO>): Promise<void> {
        const fields = Object.keys(config).map(key => `${key} = ?`).join(', ');
        const values = Object.values(config);
        
        if (fields.length === 0) return;

        await pool.execute(`UPDATE configuracion SET ${fields} WHERE id = 1`, values);
    }
}

export default new ConfiguracionRepository();
