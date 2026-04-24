import { useUser } from "../context/UserContext";
import { Navigate } from "react-router-dom";

export default function RequirePro({ children }) {
    const { user, loading } = useUser();

    if (loading) return null;

    if (!user || Number(user.isPro) !== 1) {
        return <Navigate to="/upgrade" />;
    }

    return children;
}