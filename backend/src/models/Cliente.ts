interface Cliente {
    id_cliente?: number;
    nombre: string;
    telefono: string;
    estado: 'Activo' | 'Inactivo' | 'Moroso';
}

export default Cliente;
