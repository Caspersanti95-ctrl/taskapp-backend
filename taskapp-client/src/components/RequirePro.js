import { useUser } from "../context/UserContext";
import { Navigate } from "react-router-dom";

export default function RequirePro({ children }) {
    const { user, loading } = useUser();
    console.log("USER:", user);

    if (loading) return null;

    if (!user || !user.isPro) {
        return <Navigate to="/upgrade" />;
    }

    return children;
}