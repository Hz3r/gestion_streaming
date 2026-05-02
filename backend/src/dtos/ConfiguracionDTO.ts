export interface ConfiguracionDTO {
    titulo_sitio: string;
    tema_visual: string;
    idioma: string;
    logo_url?: string;
    notificaciones: string;
    zona_horaria: string;
}

export interface UpdateConfiguracionDTO extends Partial<ConfiguracionDTO> {}
