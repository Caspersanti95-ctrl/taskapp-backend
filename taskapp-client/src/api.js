import axios from "axios";



const api = axios.create({
    baseURL: 
   "https://taskapp-backend-production-3da5.up.railway.app"
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401) {

        if (window.location.pathname !== "/login") {
            localStorage.clear();
            window.location.href = "/login";
        }
    }
        return Promise.reject(err);
    }
);

export default api;