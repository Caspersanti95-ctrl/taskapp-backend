import { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";
import "./auth.css";

export default function AuthPage() {
    const [showSignup, setShowSignup] = useState(false);
    const [isclosing, setIsClosing] = useState(false);
    const [isSignup, setIsSignup] = useState(false);
    
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "light" ? false : true
    );

         const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem("theme", newMode ? "dark" : "light");
    }

    const toggleMode = () => {
        setIsSignup(prev => !prev);
    };
    

    const openSignup = () => {
        setIsClosing(false);
        setShowSignup(true);
    };

    return (
        <div className={`login-wrapper ${darkMode ? "dark" : "light"}`}>

                <div className="theme-toggle"> 
        <button onClick={toggleTheme}>
                    {darkMode ? "Light" : "Dark"}
                </button>
                </div>

            <div className="particles"></div>
        
                <div className="toggle-container">
                    <div className={`toggle ${isSignup ? "active" : ""}`} 
                        onClick={toggleMode}
                        >
                        <div className="toggle-circle"></div>
                            <span className="toggle-label">Login</span>
                            <span className="toggle-label">Signup</span>
                        </div>
                    </div>

                    <div className="auth-card-wrapper">

                        <div className={`auth-card ${!isSignup ? "active" : "inactive"}`}>                         
                            <Login key="login" close={toggleMode} />
                        </div>

                        <div className={`auth-card ${isSignup ? "active" : "inactive"}`}>
                            <Signup key="signup" openSignup={toggleMode} />
                        </div>
                </div>
        </div>
    );
}