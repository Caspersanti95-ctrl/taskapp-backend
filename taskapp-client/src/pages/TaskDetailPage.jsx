import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import { useLocation } from "react-router-dom";
import "./TaskDetailPage.css";
import { useParams } from "react-router-dom";
import ServiceReportPage from "./ServiceReportPage";
import api from "../api";

export default function TaskDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const isNew = location.pathname === "/tasks/new";
  
  const [task, setTask] = useState({
    customer: "",
    address: "",
    technician: "",
  });
  const [activeTab, setActiveTab] = useState("report");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const saveTask = async () => {
    try {
        const res = await api.post("/tasks", {
            customer: task.customer,
            address: task.address,
            start_date: task.start_date,
            end_date: task.end_date,
            technician: task.technician,
            status: task.status,
            remarks
        });

        navigate(`/dashboard`);
    } catch (err) {
        console.error(err);
    }
    };

  // 🔹 Hent task fra backend
  useEffect(() => {
    const fetchTask = async () => {
      try {
        if (id === "new") {
            setTask({
                order_number: "",
                customer: "",
                address: "",
                start_date: "",
                end_date: "",
                technician: "",
                status: "Oprettet",
                remarks: ""
            });
            setRemarks("");
            setLoading(false);
            return;
        }

        const res = await api.get(`/tasks/${id}`);
        const data =res.data;

        setTask(data);
        setRemarks(data.remarks || "");
      } catch (err) {
        console.error("Fejl ved hentning af task", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  // 🔹 Opdater status
  const updateStatus = async (newStatus) => {
    try {
      await fetch(`/api/tasks/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      setTask((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error("Fejl ved status update", err);
    }
  };

  // 🔹 Gem remarks
  const saveRemarks = async () => {
    try {
      await fetch(`/api/tasks/${id}/remarks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remarks }),
      });
    } catch (err) {
      console.error("Fejl ved gem", err);
    }
  };

  if (loading && id !== "new") return <div className="p-6">Loader...</div>;
  if (!task) return <div className="p-6">Opgave ikke fundet</div>;

  return (
    <div className="task-page">
      <div className="task-container">

        {/* VENSTRE */}
        <div className="task-left">
          <h2>Opgave oplysninger</h2>
        <div style={{ marginBottom: "20px" }}>
          <p><strong>Ordre:</strong> {task.order_number}</p>
        </div>

        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <input
            className="input"
                placeholder="Kunde:"
                value={task.customer}
                onChange={(e) => setTask({ ...task, customer: e.target.value })}
            />
        </div>  

        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            <input
            className="input"
                placeholder="Adresse:"
                value={task.address}
                onChange={(e) => setTask({ ...task, address: e.target.value })}
            />
        </div>

        <div style={{ display: "flex", gap: "20px", marginTop: "20px", marginBottom: "20px" }}>
          <input 
            className="input"
            type="date"
            placeholder="Start dato"
            value={task.start_date}
            onChange={(e) => setTask({ ...task, start_date: e.target.value })}
            />
        </div>

        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}> 
          <input
            className="input"
            type="date"
            placeholder="Slut dato"
            value={task.end_date}
            onChange={(e) => setTask({ ...task, end_date: e.target.value })}
            />
        </div>

        <div style={{ display: "flex", gap: "20px", marginBottom: "20px"}}>
          <input 
            className="input"
            type="technician"
            placeholder="Tekniker:"
            value={task.technician}
            onChange={(e) => setTask({ ...task, technician: e.target.value })}
            />
        </div>

        
          <textarea
            className="textarea"
            placeholder="Beskrivelse af opgaven"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            onBlur={saveRemarks}
          />

          {isNew && (
            <button 
                onClick={saveTask}
                style={{
                    marginTop: "20px",
                    padding: "10px 16px",
                    background: "#3498db",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                }}
                >
                    Opret Opgave
                </button>
          )}
        </div>

        {/* HØJRE */}
        <div className="task-right">
          <h3>Skemaer</h3>

          <button
            className={activeTab === "report" ? "tab active" : "tab"}
            disabled={id === "new"}
            onClick={() => navigate(`/tasks/${id}/report`)}
          >
            📄 Service rapport
          </button>

          <button
            className={activeTab === "images" ? "tab active" : "tab"}
            onClick={() => setActiveTab("images")}
          >
            📸 Billed dokumentation
          </button>
        </div>

      </div>

      {/* INDHOLD */}
      <div className="task-content">
        
        {activeTab === "images" && <div>Billeder component her</div>}
      </div>

      {/* STATUS */}
      <div className="task-footer">
        <p>Status: <strong>{task.status}</strong></p>

    <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>

        {task.status === "Oprettet" && (
          <button onClick={() => startTask(task.id)}>
            Start opgave
          </button>
        )}

        {task.status === "I gang" && (
          <button onClick={() => completeTask(task.id)}>
            Afslut opgave
          </button>
        )}

        {task.status === "Afsluttet" && (
          <button onClick={() => approveTask(task.id)}>
            Godkend
          </button>
        )}
        </div>
      </div>
    </div>
  );
}

