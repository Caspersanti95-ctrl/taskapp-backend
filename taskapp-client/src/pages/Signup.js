import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Signup({ onFlip }) {

    const navigate = useNavigate();

    const [error, setError] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSignup = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Adgangskoderne matcher ikke");
            return;
        }

        try {
           const res = await api.post("/auth/register", {
                name,
                email,
                password
            });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.user.role);

            navigate("/dashboard");
        } catch (err) {
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

        <button className="login-button" onClick={handleSignup}>
            Opret Konto
            </button>

            <p className="link" onClick={onFlip}>
                Har du allerede en konto? Log ind
            </p>
        </div>
    );
}