import Plataforma from "../models/Plataforma.js";
import PlataformaDTO from "../dtos/PlataformaDTO.js";
import PlataformaRepository from "../repositories/PlataformaRepository.js";

class PlataformaService{

    async crearPlataforma(plataforma:Plataforma):Promise<PlataformaDTO>{
        const id = await PlataformaRepository.crear(plataforma);
        return {
            id_plataforma: id,
            nombre: plataforma.nombre
        }
    }

    async obtenerTodas():Promise<PlataformaDTO[]>{
        const plataformas = await PlataformaRepository.obtenerTodas();
        return plataformas.map(p => ({
            id_plataforma: p.id_plataforma,
            nombre: p.nombre
        }));
    }

    async obtenerPorId(id:number):Promise<PlataformaDTO>{
        const plataforma = await PlataformaRepository.obtenerPorId(id);
        if(!plataforma){
            throw new Error('Plataforma no encontrada');
        }
        return {
            id_plataforma: plataforma.id_plataforma,
            nombre: plataforma.nombre
        }
    }

    async actualizarPlataforma(id:number, plataforma:Plataforma):Promise<PlataformaDTO>{
        const existe = await PlataformaRepository.obtenerPorId(id);
        if(!existe){
            throw new Error('Plataforma no encontrada');
        }
        await PlataformaRepository.actualizar(id, plataforma);
        return {
            id_plataforma: id,
            nombre: plataforma.nombre
        }
    }

    async eliminarPlataforma(id:number):Promise<void>{
        const existe = await PlataformaRepository.obtenerPorId(id);
        if(!existe){
            throw new Error('Plataforma no encontrada');
        }
        await PlataformaRepository.eliminar(id);
    }
}

export default new PlataformaService();
