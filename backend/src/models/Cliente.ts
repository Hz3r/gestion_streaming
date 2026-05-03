interface Cliente {
    id_cliente?: number;
    nombre: string;
    telefono: string;
    estado: 'Activo' | 'Inactivo' | 'Moroso';
    tipo?: string;
}

export default Cliente;
