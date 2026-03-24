import Plataforma from "../models/Plataforma";
import PlataformaDTO from "../dtos/PlataformaDTO";
import PlataformaRepository from "../repositories/PlataformaRepository";

class PlataformaService{

    async crearPlataforma(plataforma:Plataforma):Promise<PlataformaDTO>{
        const id = await PlataformaRepository.crear(plataforma);
        return {
            nombre: plataforma.nombre,
            max_perfiles: plataforma.max_perfiles
        }
    }

    async obtenerTodas():Promise<PlataformaDTO[]>{
        const plataformas = await PlataformaRepository.obtenerTodas();
        return plataformas.map(p => ({
            nombre: p.nombre,
            max_perfiles: p.max_perfiles
        }));
    }

    async obtenerPorId(id:number):Promise<PlataformaDTO>{
        const plataforma = await PlataformaRepository.obtenerPorId(id);
        if(!plataforma){
            throw new Error('Plataforma no encontrada');
        }
        return {
            nombre: plataforma.nombre,
            max_perfiles: plataforma.max_perfiles
        }
    }

    async actualizarPlataforma(id:number, plataforma:Plataforma):Promise<PlataformaDTO>{
        const existe = await PlataformaRepository.obtenerPorId(id);
        if(!existe){
            throw new Error('Plataforma no encontrada');
        }
        await PlataformaRepository.actualizar(id, plataforma);
        return {
            nombre: plataforma.nombre,
            max_perfiles: plataforma.max_perfiles
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
