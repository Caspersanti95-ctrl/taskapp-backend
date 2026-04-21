import { useEffect } from "react";

export default function Success() {

        useEffect(() => {
        console.log("User is now PRO");
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
            <p style={{ fontSize: "18px" }}>Du har nu adgang til alle funktioner i Service System.</p>
        </div>
    );
}