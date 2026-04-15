import { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";
import "./auth.css";

export default function AuthPage() {
    const [isFlipped, setIsFlipped] = useState(false);
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "light" ? false : true
    );

         const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem("theme", newMode ? "dark" : "light");
    }

    return (
        <div className={`login-wrapper ${darkMode ? "dark" : "light"}`}>

                <div className="theme-toggle"> 
        <button onClick={toggleTheme}>
                    {darkMode ? "Light" : "Dark"}
                </button>
                </div>

            <div className="particles"></div>

            {isFlipped ? (
                <Signup onFlip={() => setIsFlipped(false)} />                        
             ) : (
                <Login onFlip={() => setIsFlipped(true)} />        
            )}
                
            
        </div>
    );
}