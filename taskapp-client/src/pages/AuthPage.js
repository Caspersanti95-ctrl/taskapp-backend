import { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";
import "./auth.css";

export default function AuthPage() {
    const [showSignup, setShowSignup] = useState(false);
    const [isclosing, setIsClosing] = useState(false);
    
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "light" ? false : true
    );

         const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem("theme", newMode ? "dark" : "light");
    }

    const openSignup = () => {
        setIsClosing(false);
        setShowSignup(true);
    };

    const closeSignup = () => {
        setIsClosing(true);

        setTimeout(() => {
            setShowSignup(false);
            setIsClosing(false);
        }, 300);
    }

    return (
        <div className={`login-wrapper ${darkMode ? "dark" : "light"}`}>

                <div className="theme-toggle"> 
        <button onClick={toggleTheme}>
                    {darkMode ? "Light" : "Dark"}
                </button>
                </div>

            <div className="particles"></div>

            <Login openSignup={openSignup} />

            {showSignup &&  (
                <div className="overlay" onClick={closeSignup}>
                    <div 
                        className={`signup-container ${isclosing ? "closing" : ""}`} 
                            onClick={(e) => e.stopPropagation()}
                            >
                        <Signup onFlip={closeSignup} />
                    </div>
                </div>
            )}
                
            
        </div>
    );
}