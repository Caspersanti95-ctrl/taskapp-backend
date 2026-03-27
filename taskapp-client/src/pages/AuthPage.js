import { useState } from "react";
import Login from "./Login";

import "./auth.css";

export default function AuthPage() {
    
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

            <Login />
        </div>
    );
}