import ConfiguracionRepository from "../repositories/ConfiguracionRepository";
import { ConfiguracionDTO, UpdateConfiguracionDTO } from "../dtos/ConfiguracionDTO";

class ConfiguracionService {
    async obtenerConfiguracion(): Promise<ConfiguracionDTO> {
        return await ConfiguracionRepository.obtenerConfiguracion();
    }

    async actualizarConfiguracion(config: UpdateConfiguracionDTO): Promise<void> {
        await ConfiguracionRepository.actualizarConfiguracion(config);
    }
}

export default new ConfiguracionService();
