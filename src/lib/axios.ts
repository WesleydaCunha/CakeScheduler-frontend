import axios from "axios";

export const api_axios = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL as string,
})