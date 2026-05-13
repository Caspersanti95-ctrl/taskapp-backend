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
  const statusColors = {
      "Oprettet": "#e74c3c",
      "I gang": "#f1c40f",
      "Afsluttet": "#2ecc71",
      "Godkendt": "#3498db"
  };

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

    const updateTask = async () => {
        try {
            await api.put(`/tasks/${id}`, {
                customer: task.customer,
                address: task.address,
                start_date: task.start_date,
                end_date: task.end_date,
                technician: task.technician,
                status: task.status,
                remarks
            });

            console.log("Task opdateret");
        } catch (err) {
            console.error("Fejl ved gem:", err);
        }
    };

    const fetchTask = async () => {
      try {
        if (isNew) {
            setTask({
                order_number: "",
                customer: "",
                address: "",
                start_date: "",
                end_date: "",
                technician: "",
                status: "",
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

  // 🔹 Hent task fra backend
  useEffect(() => {    
    fetchTask();
  }, [id]);

    const status = task?.status || "Oprettet";
    const isLocked = task?.approved === 1;

    const startTask = async (id) => {
        try {    
            await api.put(`/tasks/${id}/start`);
            setTask((prev) => ({ ...prev, status: "I gang" }));
        } catch (err) {
            console.error("Fejl ved start af task", err);
        }
    };

    const completeTask = async (id) => {
        try {
            await api.put(`/tasks/${id}/complete`);
            setTask((prev) => ({ ...prev, status: "Afsluttet" }));
        } catch (err) {
            console.error("Fejl ved afslutning af task", err);
        }
    };

  if (loading && id !== "new") return <div className="p-6">Loader...</div>;
  if (!task) return <div className="p-6">Opgave ikke fundet</div>;

  return (
    <div className="task-page">
      <div className="task-container">

        <div className="task-left">
          <h2>Opgave oplysninger</h2>

        <div className="order-box">
          <span className="order-label">Ordre:</span>

          <div className="order-number">
          {task.order_number}
        </div>
      </div>

      <div className="form-group">
        <label>Kunde:</label>
          <input
                className="input"
                value={task.customer || ""}
                disabled={isLocked}
                onChange={(e) => setTask({ 
                            ...task, 
                            customer: e.target.value 
                          })
                        }
                onBlur={updateTask}
            />
          </div>
         
      <div className="form-group">
        <label>Adresse:</label>
            <input
                className="input"
                value={task.address}
                disabled={isLocked}
                onChange={(e) => setTask({ ...task, address: e.target.value })}
                onBlur={updateTask}
            />
      </div>

      <div className="date-grid">

        <div className="form-group"> 
        <label>Start dato:</label>
          <input 
            className="input"
            type="date"
            value={task.start_date}
            disabled={isLocked}
            onChange={(e) => setTask({ ...task, start_date: e.target.value })}
            onBlur={updateTask}
            />
        </div>

        <div className="form-group"> 
          <label>Slut dato:</label>
          <input
            className="input"
            type="date"
            value={task.end_date}
            disabled={isLocked}
            onChange={(e) => setTask({ ...task, end_date: e.target.value })}
            onBlur={updateTask}
            />
        </div>

        </div>
      
      <div className="form-group">
        <label>Tekniker:</label>
          <input 
            className="input"
            value={task.technician || ""}
            disabled={isLocked}
            onChange={(e) => setTask({ ...task, technician: e.target.value })}
            onBlur={updateTask}
            />
          </div>
      
      <div className="form-group">
        <label>Beskrivelse af Opgaven:</label>
          <textarea
            className="textarea"
            value={remarks}
            disabled={isLocked}
            onChange={(e) => setRemarks(e.target.value)}
            onBlur={updateTask}
          />
        </div>
      
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

      {/* STATUS */}
      <div className="task-footer">

          <div className="status-row">
            <span>Status:</span>

            <div className="status-pill godkendt">
            <span className={`status ${status}`}>
              {status}
              </span> 
              </div>
          </div>
        
            
    
      {isLocked && (
        <div className="locked-box">
          Opgaven er Godkendt og kan ikke længere redigeres.
          </div>
      )}


        {status === "Oprettet" && (
          <button 
            className="action-button"
            onClick={() => startTask(task.id)}>
              Start opgave
          </button>
        )}

        {status === "I gang" && (
          <button 
            className="action-button"
            onClick={() => completeTask(task.id)}>
              Afslut opgave
          </button>
        )}

        </div>
      </div>
    

    
  );
}

