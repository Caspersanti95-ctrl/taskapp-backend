export default function ProModal({ onClose, onUpgrade }) {
    return (
        <div style={overlay}>
            <div style={modal}>
                <h2>Pro Feature</h2>
                <p>Du skal have Pro for at bruge denne funktion</p>

                <button onClick={onUpgrade}>
                    Opgrader til Pro
                </button>

                <button onClick={onClose}>
                    Luk
                </button>
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000
};

const modal = {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "8px",
    color: "white",
    textAlign: "center",    
};