import { createContext, useContext, useState, useEffect } from "react";
const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setLoading(false);
                return;
            }

            const res = await fetch("https://taskapp-backend-production-3da5.up.railway.app/auth/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                setUser(null);
                return;
            }

            const data = await res.json();
            setUser(data);
            return data;
        } catch (err) {
            console.error("Fetch user failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect (() => {
        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, fetchUser, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(useContext);