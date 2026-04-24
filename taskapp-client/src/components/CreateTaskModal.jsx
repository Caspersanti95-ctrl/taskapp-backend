import { useNavigate } from "react-router-dom";

export default function CreateTaskModal({ onClose }) {
    const navigate = useNavigate();

    const goToTask = () => {
        onClose();
        navigate("/tasks/new");
    };
    return (
        <div style={overlay}>
            <div style={modal}>
                <h2>Opret Opgave</h2>

                <button onClick={goToTask}>
                    Service Rapport
                </button>

                <button onClick={onClose}>Luk</button>
            </div>
        </div>
    );
}

const overlay = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "#010840",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
};

const modal = {
    background: "#111",
    padding: "30px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
};