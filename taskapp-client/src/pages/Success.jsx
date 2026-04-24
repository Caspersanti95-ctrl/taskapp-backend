import { useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate  } from "react-router-dom";

export default function Success() {
    const { fetchUser } = useUser();
    const navigate = useNavigate();

        useEffect(() => {
            const run = async () => {
                try {
                    const token = localStorage.getItem("token");

                    if (!token) {
                        navigate("/login");
                        return;
                    }

                    await fetchUser();
                    navigate("/dashboard");
                } catch (err) {
                    console.error("Fejl i success flow:", err);
                    navigate("/dashboard");
                }
            };
            
            run();
    } , []);
    return (
        <div style ={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center",             
            height: "100vh",
            background: "#0f172a",
            color: "white",
            flexDirection: "column" 
            }}
        >
            <h1 style={{ fontSize: "48px", marginBottom: "20px" }}>Tak for dit køb!</h1>
            <p style={{ fontSize: "18px" }}>Du har nu adgang til flere funktioner i FLOW System.</p>
        </div>
    );
}