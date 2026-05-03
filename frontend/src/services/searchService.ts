import api from "./api";

export const searchGlobal = async (query: string) => {
    return api.get(`/search?q=${query}`);
};
