import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Signup({ close }) {

    const navigate = useNavigate();

    const [error, setError] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [logo, setLogo] = useState(null);

    const handleSignup = async (e) => {
        e.preventDefault();


        if (password !== confirmPassword) {
            setError("Adgangskoderne matcher ikke");
            return;
        }

        try {

            let logoUrl =  "";

            if (logo) {
                const formData = new FormData();
                formData.append("logo", logo);
                const uploadRes = await api.fetch("http://localhost5000/api/upload-logo", {
                    method: "POST",
                    body:formData,
                });
                const data = await uploadRes.json();
                logoUrl = data.url;
            }

                
           const res = await api.post("/auth/register", {
                name,
                email,
                password,
                logo: logoUrl
            });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.user.role);

            navigate("/dashboard");

        } catch (err) {
            console.log("BACKEND ERROR:", err.response?.data);
            setError("Signup fejlede");
        }
    };

    return (
        <div className="login-card">

            <h1 className="logo">FLOW DAY</h1>
            <p className="subtitle">Opret Konto</p>

            {error && <div className="login-error">{error}</div>}

        <div className="input-group">
            <input value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required
                />
                    <label>Navn</label>
        </div>

        <div className="input-group">
            <input type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                 />
                    <label>E-mail</label>
        </div>

        <div className="input-group">
            <input type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                 />
                    <label>Adgangskode</label>
        </div>

        <div className="input-group">
            <input type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                 />
                    <label>Gentag Adgangskode</label>
        </div>

        <input type="file" accept="image/*" 
                onChange={(e) => setLogo(e.target.files[0])} 
                style={{ marginBottom: "20px" }}
            />

        <button className="login-button" onClick={handleSignup}>
            Opret Konto
            </button>

            <p className="link" onClick={close}>
                Har du allerede en konto? Log ind
            </p>
        </div>
    );
}