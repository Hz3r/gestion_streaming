import api from "./api";

export const getConfiguracion = async () => {
    return api.get("/configuracion");
};

export const updateConfiguracion = async (data: any) => {
    return api.put("/configuracion", data);
};
