import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { FiEye, FiEyeOff } from "react-icons/fi";


export default function Login() {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [showPassword,setShowPassword] = useState(false);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const [darkMode,setDarkMode] = useState(
    localStorage.getItem("theme") === "light" ? false : true
  );
  const [fadeOut,setFadeOut] = useState(false);
  const [buttonState,setButtonState] = useState("idle");
  const [shake, setShake] = useState(false);

  const navigate = useNavigate();

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");
    setLoading(true);
    //setButtonState("loading");

    

    try {

      const res = await api.post("/auth/login",{
        email,
        password
      });

      localStorage.setItem("token",res.data.token);
      localStorage.setItem("role",res.data.user.role);
      localStorage.setItem("username", res.data.username);

      setButtonState("success");
   
      setFadeOut(true);

      setTimeout(() => {
      navigate("/dashboard");
    }, 1000);

  

    } catch(err) {

        console.log("LOGIN FAILED");
      setError("Forkert email eller password");
      setButtonState("idle");
      setLoading(false);

      setShake(true);
       
      setTimeout(() => {
        setShake(false);
      }, 500);

      return;
    }

    
  };

  return (

  <div className={`login-wrapper ${darkMode ? "dark" : "light"} ${fadeOut ? "fade-out" : ""}`}
            onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin(e);
            }}
         >

    {/* Dark / Light toggle */}
    <div className="theme-toggle">
      <button onClick={toggleTheme}>
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </button>
    </div>

    {/* particles */}
    <div className="particles"></div>

    <div className={`login-card ${shake ? "shake" : ""}`}>

      <h1 className="logo">FLOW DAY</h1>
      <p className="subtitle">Monitor Dashboard</p>

      {error && <div className="login-error">{error}</div>}



    <div>
      <div className="input-group">

        <input
        autoFocus
          type="text"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />

        <label>Email</label>

      </div>

      <div className="input-group">

        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
        />

        <label>Password</label>

        <span
          className="show-password"
          onClick={()=>setShowPassword(!showPassword)}
        >
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </span>

      </div>

      <button
        type="button"
        onClick={handleLogin} 
        className={`login-button ${buttonState}`}
        disabled={!email || !password || buttonState === "loading"}
      >
        {buttonState === "idle" && "Log ind"}
        {buttonState === "loading" && (
            <div className="spinner"></div>
        )}

        {buttonState === "success" && " ✓ "}
      </button>
   </div>
      <p className="copyright">
        © 2026 CASSA
      </p>

    </div>

  </div>

  );
}