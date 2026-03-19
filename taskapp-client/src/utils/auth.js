export const getToken = () => localStorage.getItem("token");

export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
};

export const getRole = () => localStorage.getItem("role");