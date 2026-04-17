import React, { useState, useEffect } from 'react';
import api from "./api";
import { BrowserRouter, Routes, Route, useNavigate, Navigate, Outlet } from 'react-router-dom';
import ServiceReportPage from './pages/ServiceReportPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { io, Manager} from "socket.io-client";
import AuthPage from "./pages/AuthPage";
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import SettingsModal from './components/SettingsModal';

const StatCard = ({ title, value, theme, color, icon, onClick }) => (
  <div
  onClick={onClick} 

  onMouseEnter={(e)=>{
    e.currentTarget.style.transform = "translateY(-6px)";
    e.currentTarget.style.boxShadow = "0 12px 25px rgba(0,0,0,0.3)";
  }}

  onMouseLeave={(e)=>{
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = theme.shadow;
  }}

  style={{
    background: theme.cardBg,
    color: theme.text,
    padding: "20px",
    borderRadius: "12px",
    boxShadow: theme.shadow,
    transition: "0.2s",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeft: `6px solid ${color}`
  }}
  >

<div>
    <div style={{ fontSize: "14px", opacity: 0.7}}>{title}</div>
    <div style={{ fontSize: "28px", fontWeight: "bold" }}>{value}</div>
  </div>

  <div style={{
    fontSize: "26px",
    opacity: 0.7
  }}>
    {icon}
  </div>
  </div>
);

  const lightTheme = {
    background: "#eef2f7",
    cardBg: "white",
    text: "black",
    shadow: "0 4px 12px rgba(0,0,0,0.08)"
  };

  const darkTheme = {
    background: "#001c4a",
    cardBg: "#010840",
    text: "white",
    shadow: "0 4px 12px rgba(0,0,0,0.4)"
  };

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  };

  const modalStyle = {
    background: "linear-gradient(145deg, #0f172a, #020617)",
    padding: "30px",
    borderRadius: "16px",
    width: "400px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    boxShadow: "0 25px 80px rgba(0,0,0,0.6)",
    border: "1px solid #1e293b"
  };

function Dashboard() {

  // useState
  const [tasks, setTasks] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [logo, setLogo] = useState(null);
  const [phone, setPhone] = useState("");
  const [users, setUsers] = useState([]);
  const [position, setPosition] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [activeTab, setActiveTab] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [originalUser, setOriginalUser] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const navigate = useNavigate();

  //Selected
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // New
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState("");

  //stats
  const [monthStats, setMonthStats] = useState(null);
  const [yearStats, setYearStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Alle");

 

  // Show
  const [showUserModal, setShowUserModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Editing
  const [editingUser, setEditingUser] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedRole, setEditedRole] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [editedPosition, setEditedPosition] = useState("");
  const [editedPassword, setEditedPassword] = useState("");
  const [repeatEditedPassword, setRepeatEditedPassword] = useState("");

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");

      if (saved !== null) {
        return JSON.parse(saved);
      } 
       
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
        
      
  });
 const theme = darkMode ? darkTheme : lightTheme;

  const handleLogoUpload = async (file) => {
    const formData = new FormData();
    formData.append("logo", file);

      try {
        const res = await api.post("/company/logo", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
        
        setLogo(res.data.url);

        setUser(prev => ({ 
          ...prev, 
          logo: res.data.url 
        }));

        localStorage.setItem("logo", res.data.url);

      } catch (err) {
        console.error(err);
      }
  };

  const deleteLogo = async () => {
    try {
      await api.delete("/delete-logo");
      setLogo(null);
      setUser(prev => ({
        ...prev,
        logo: null
      }));
      localStorage.removeItem("logo");
      alert("Logo slettet");
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
    const res = await api.get("/auth/users");
    setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
      fetchUsers();    
  }, []);

  const saveUser = async () => {
    try {
        setLoadingSave(true);

      if (editedPassword !== repeatEditedPassword) {
        alert("Adgangskoder matcher ikke");
        return;
      }

      const data = {};

      if (editedName !== editingUser.name) {
        data.name = editedName;
      }

      if (editedEmail !== editingUser.email) {
        data.email = editedEmail;
      }
       
      if (editedPhone !== editingUser.phone) {
        data.phone = editedPhone;
      }

      if (editedRole !== editingUser.role) {
        data.role = editedRole;
      }

      if (editedPassword && editedPassword?.trim() !== "") {
        data.password = editedPassword;
      }

      if (Object.keys(data).length === 0) {
        alert("Ingen ændringer");
        return;
      }

      await api.put(`/auth/users/${editingUser.id}`, data);

     const res = await api.get("/auth/users");
      setUsers(res.data);

      setEditingUser(null);

      alert("Bruger opdateret");

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSave(false);
    }
  }; 
  
  const fetchTasks = async () => {
      try {
        const response = await api.get("/tasks");

        setTasks(response.data);

      } catch (error) {
        if (error.response && error.response.status === 401) {
          logout();
          navigate("/login");
        } else {
        console.error(error);
      }
    }
  };



  const fetchYearStats = async () => {
    try {
      const res = await api.get(`/tasks/stats/year?year=${selectedYear}`);
      setYearStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

 const openNewTask = () => {
  navigate("/tasks/new");
 };

  const completeTask = async (id) => {
    try {
      await api.put(`/tasks/${id}/complete`, 
        {},
       );

      fetchTasks();

    } catch (error) {
      console.error("COMPLETE ERROR:", error);
    }
  };

  const startTask = async (id) => {
    try {
      await api.put(`/tasks/${id}/start`, {});
      fetchTasks();
    } catch (error) {
      console.error("START ERROR:", error);
    }
  };

  const approveTask = async (id) => {
    await api.put(`/tasks/${id}/approve`, 
      {},
      
  );

    fetchTasks();
  };

  const createUser = async () => {

    if (!newName || !newEmail || !newPassword || !newRole) {
      toast.error("Udfyld alle felter");
      return;
    }

    if (newPassword !== repeatPassword) {
      toast.error("Adgangskode matcher ikke");
      return;
    }

    setLoadingCreate(true);

    try {

    await api.post("/auth/create-monitor", {
      name: newName,
      email:newEmail,
      password: newPassword,
      role: newRole,
      phone: newPhone
    });

    toast.success("Bruger oprettet");

    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setRepeatPassword("");
    setNewRole("");
    setEditedPhone("");

    setShowUserModal(false);
    fetchUsers();

  } catch (err) {
    toast.error("Kunne ikke oprette bruger");
    console.error(err);
    } finally {
      setLoadingCreate(false);
    }
  };

 
    const deleteUser = async (userId) => {
      const confirmDelete = window.confirm("Er du sikker på, at du vil slette denne bruger?");
      if (!confirmDelete) return;

      try {
        await api.delete(`/auth/users/${userId}`);
       fetchUsers();
      } catch (err) {
        console.error(err);
      }
  };

  const handleEdit = () => {
    setOriginalUser({
      name: editedName,
      phone: editedPhone,
      role: editedRole,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedName(originalUser.name ?? "");
    setEditedPhone(originalUser.phone ?? "");
    setEditedRole(originalUser.role ?? "");
    setEditedPassword("");

    setIsEditing(false);
  };

  const permissions = {
    monitor: {
      canCreateTask: false,
      canCreateUser: false,
      canViewSettings: false
    },

    manager: {
      canCreateTask: true,
      canCreateUser: false,
      canViewSettings: true
    },

    admin: {
      canCreateTask: true,
      canCreateUser: true,
      canViewSettings: true
    },

  };
  const userPermissions = permissions[role] || {};

  // Styling Objects
  const dashboardWrapper = {
    
    padding: "40px",
    paddingTop: "120px",
    fontFamily: "Arial",
    background: theme.background,
    minHeight: "100vh",
    color: theme.text,
    transition: "all 0.3s ease"
  };

  const topbarStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    boxSizing: "border-box",
    zIndex: 1000,

    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
   
    background: theme.cardBg,
    padding: "12px 20px",
    
    boxShadow: theme.shadow
  };

  const logoutButton = {
    padding: "8px 12px",
    background: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  };

  const statsGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "15px",
    marginTop: "20px",
    marginBottom: "30px"
  };

  const taskGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px"
  };

  const taskCard = {
    background: theme.cardBg,
    padding: "20px",
    borderRadius: "12px",
    boxShadow: theme.shadow,
    transition: "all 0.2s ease",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "140px"
  }; 

  const statusColor = {
    Oprettet: "#f39c12",
    "I gang": "#3498db",
    Afsluttet: "#e74c3c",
    Godkendt: "#2ecc71" 
  };

  const buttonStyle = {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    transition: "0.2s",
};

  const inputStyle = {
    padding: "16px 14px",
    borderRadius: "12px",
    border: "none",
    background: "#020617",
    color: "white",
    width: "100%",
    outline: "none",
    boxSizing: "border-box"
  }; 

  const startEdit = (user) => {
    setEditingUser(user);
    
    setEditedName(user.name);
    setEditedEmail(user.email);
    setEditedPhone(user.phone);
    setEditedRole(user.role);

    setEditedPassword("");
    setRepeatEditedPassword("");

    setOriginalUser(user);

    setIsEditing(true);
  };

  const openUser = (user) => {
    setEditingUser(user);
    setIsEditing(false);
  };





  useEffect(() => {
    console.log("TOKEN IN DASHBOARD:", token);
    const init = async () => {
    if (!token) return;

    setLoading(true);

      await fetchTasks();
      await fetchUsers();

      setLoading(false);
    };

      init();
  }, [token]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
        setRole(res.data.role);
        setUsername(res.data.name);       

        if (res.data.logo && res.data.logo !== "null") {
          setLogo(res.data.logo);
          localStorage.setItem("logo", res.data.logo);
        } else {
          setLogo(null);
          localStorage.removeItem("logo");
        }

          localStorage.setItem("username", res.data.name);

      } catch (err) {
        console.error("FETCH ME ERROR:", err);
      }
    };

    if (token) 
      fetchMe();
    }, [token]);

    useEffect(() => {
      if (selectedLogo) {
        const preview = URL.createObjectURL(selectedLogo);
        setLogo(preview);
      }
    }, [selectedLogo]);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (token) {
      fetchYearStats();
    }
  }, [selectedYear, token]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL);

    socket.on("taskUpdated", () => {
      console.log("Realtime update modtaget");
      fetchTasks();
      fetchYearStats();
    });

    return () => {
      socket.disconnect();
      console.log("SOCKET URL:", import.meta.env.VITE_API_URL);
    };
  }, []);


  
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    setToken(null);
    setRole(null);
    setTasks([]);
    navigate("/login");
  };

  const ProtectedRoute = () => {
    const token =localStorage.getItem("token");
  
      return token ? <Outlet /> : <Navigate to="/login" replace />;
    };

  const total = tasks.length;
  const open = tasks.filter(t => t.status === "Oprettet").length;
  const done = tasks.filter(t => t.status === "Afsluttet").length;
  const approved = tasks.filter(t => t.status === "Godkendt").length;
  const filteredTasks = tasks.filter(task  => {
    if (statusFilter === "Alle") return true;
    return task.status === statusFilter;
  });

  if (!user) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid #334155",
          borderTop: "4px solid #22c55e",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
      </div>
    );
  }

    return (
  <>
    <Toaster position="center" />

      <div style={dashboardWrapper}>
        {/* Topbar */}
      <div style={topbarStyle}>

      <div style={{ flex: 1, justifyContent: "start" }}>
        <h2 style={{
                margin: 0,
              }}
             >
                Velkommen {username ? `- ${username}` : ""} 👋
              </h2>
        </div>
        
        <div style ={{ flex: 1, display: "flex", justifyContent: "center" }}>        
          {logo && logo !== "null" ? (
            
            <img 
              src={logo}  
              alt="Logo"
              style={{ height: "100px", objectFit: "contain" }} 
              onError={(e) => {
                e.target.style.display = "none";
              }}
            /> 
          ) : (
            <div 
              style={{
                width: "100px",
                height: "100px",
                border: "2px dashed #334155",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                fontSize: "12px",
                gap: "4px"
              }}
            >              
            📷 Intet logo
            </div>
          )}
          </div>
         
       

        <div style={{ flex: 1, justifyContent: "flex-end", display: "flex", alignItems: "center", gap: "12px" }}>

          <span style={{ marginRight: "15px" }}>Rolle: <strong>{role}</strong>
          </span>

          {role === "admin" && (
            <button onClick={() => setShowSettings(true)}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
              style={{
                padding: "8px 12px",
                background: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              ⚙️ Indstillinger
            </button> 
          )}

          <button
                onClick={() => setDarkMode(!darkMode)}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                style={{
                  marginRight: "10px",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: darkMode ? "#f1f1f1" : "#222",
                  color: darkMode ? "#222" : "#fff",
                  transition: "all 0.2s ease"
                }}
              >
                {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

          <button onClick={logout} style={logoutButton}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            Log ud
          </button>
             
        </div>
      </div> 

      {userPermissions.canViewSettings && showSettings && (
  <SettingsModal
    onClose={() => setShowSettings(false)}

    user={user}
    selectedLogo={selectedLogo}
    setSelectedLogo={setSelectedLogo}
    handleLogoUpload={handleLogoUpload}
    deleteLogo={deleteLogo}

    newName={newName}
    setNewName={setNewName}
    newEmail={newEmail}
    setNewEmail={setNewEmail}
    newPassword={newPassword}
    setNewPassword={setNewPassword}
    repeatPassword={repeatPassword}
    setRepeatPassword={setRepeatPassword}
    newPhone={newPhone}
    setNewPhone={setNewPhone}
    newRole={newRole}
    setNewRole={setNewRole}
    createUser={createUser}
    loadingCreate={loadingCreate}
    loadingSave={loadingSave}
    loading={loading}

    users={users}
    startEdit={startEdit}
    deleteUser={deleteUser}
    editingUser={editingUser}
    setEditingUser={setEditingUser}
    saveUser={saveUser}
    isEditing={isEditing}
    setIsEditing={setIsEditing}
    originalUser={originalUser}
    setOriginalUser={setOriginalUser}
    pendingAction={pendingAction}
    setPendingAction={setPendingAction}
    handleEdit={handleEdit}
    handleCancel={handleCancel}

    editedName={editedName}
    setEditedName={setEditedName}
    editedEmail={editedEmail}
    editedPhone={editedPhone}
    setEditedPhone={setEditedPhone}
    editedRole={editedRole}
    setEditedRole={setEditedRole}
    editedPassword={editedPassword}
    setEditedPassword={setEditedPassword}
    repeatEditedPassword={repeatEditedPassword}
    setRepeatEditedPassword={setRepeatEditedPassword}
  />
)}


   
      {/* Statistik*/}
      <div style={statsGrid}>
        <StatCard title="Total" value={total} theme={theme} color="#6366f1" onClick={() => setStatusFilter("Alle")} />
        <StatCard title="Åbne" value={open} theme={theme} color="#f59e0b" onClick={() => setStatusFilter("Oprettet")} />
        <StatCard title="Afsluttet" value={done} theme={theme} color="#ef4444" onClick={() => setStatusFilter("Afsluttet")} />
        <StatCard title="Godkendt" value={approved} theme={theme} color="#10b981" onClick={() => setStatusFilter("Godkendt")} />
      </div>

       
      <h1>Opgaver</h1>

        <hr />

        {/* Loading */}
        {loading && <div className="spinner"></div>}

      {/* Task Grid */}
      {role === "admin" && (
        <div style={{ marginBottom: "30px" }}>
          
          {userPermissions.canCreateTask && (
          <button onClick={openNewTask} 
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            style={{ 
            padding: "8px 14px",
            borderRadius: "6px",
            border: "none",
            background: "#3498db",
            color: "white",
            cursor: "pointer"
              }}>
            ➕ Opret Opgave
          </button>
          )}
        </div>
      )}

      
      <div style={{ marginBottom: "30px"}}>

        <h3>Års Statistik</h3>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{
              padding: "6px",
              marginBottom: "15px"
            }}>
              {[2023, 2024, 2025, 2026].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
              </select>

              {yearStats && (
                <div style={{
                  background: theme.cardBg,
                  padding: "20px",
                  borderRadius: "10px",
                  boxShadow: theme.shadow
                }}>
                  <p>Total opgaver: <strong>{yearStats.total}</strong></p>
                  <p>Godkendte: <strong>{yearStats.approved}</strong></p>
                  <p>Procent godkendt:{" "}
                    <strong>
                      {yearStats.total > 0
                        ? Math.round((yearStats.approved / yearStats.total) * 100) 
                        : 0}%
                    </strong>
                  </p>
              </div>
              )}  
      </div>
      <div style={taskGrid}>

      {filteredTasks.map((task) => (
       <div 
          key={task.id} 
            style={taskCard}
              onClick={() => navigate(`/tasks/${task.id}`) }
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
              }}
              
              >
              
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: statusColor[task.status]
                }} />
          <strong>{task.status}</strong>
          </div>
          <br />

          <div style={{ marginTop: "10px", fontWeight: "600" }}>
            {task.customer || "Ingen kunde"}
          </div>

          <div style={{ fontSize: "12px", opacity: 0.7 }}>
            {task.address || "Ingen adresse"}
          </div>
        
              
            <div style={{ marginTop: "auto" }}>
            {task.approved === 1 ? (
              
                <button
                onClick={(e) => {
                  e.stopPropagation(); //VIGTIGT
                  window.open(
                    `${import.meta.env.VITE_API_URL}/tasks/${task.id}/pdf`,
                    "_blank"
                  );
                }}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#111827",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
                >
                  Download PDF
                </button>
             ) : (
              <div style={{
                 height: "32px"
              }} />
              
            )}
          </div>   
       
              

             
                      
        {(role === "monitor" || role === "admin") && 
          task.status === "Oprettet" &&(
            <button 
              onClick={(e) => {
              e.stopPropagation();
              startTask(task.id);
            }}
              onMouseEnter={(e) => e.target.style.background = "#0062ff"}
              onMouseLeave={(e) => e.target.style.background = "white"}
              style={{
                  ...buttonStyle,
                  background: "white",
                  color: "Sort"
                }}
            >
              Start
            </button>
          )}
        

         {(role === "monitor" || role === "admin") && 
          task.status === "I gang" && (
            <button 
            onClick={(e) => { 
              e.stopPropagation();
              completeTask(task.id);
            }}
              onMouseEnter={(e) => e.target.style.background = "#00ff00fe"}
              onMouseLeave={(e) => e.target.style.background = "white"}
              style={{
                  ...buttonStyle,
                  background: "white",
                  color: "Sort"
                }}              
            >
              Afslut
            </button>
          )} 

          {role === "admin" && 
          task.status === "Afsluttet" && (
            <button 
              onClick={(e) => {
              e.stopPropagation(); 
              approveTask(task.id);
              }}
              onMouseEnter={(e) => e.target.style.background = "#ef4444"}
              onMouseLeave={(e) => e.target.style.background = "white"}
              style={{
                  ...buttonStyle,
                  background: "white",
                  color: "Sort"
                  }}
            >
              Godkend
            </button>
          )}

        </div>
      ))}

      
    </div>
  </div>


    {showUserModal && (

<div style={{
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000
}}>

<div style={{
  background: theme.cardBg,
  padding: "30px",
  borderRadius: "12px",
  width: "400px",
  boxShadow: theme.shadow
}}>

<h3>Opret ny bruger</h3>

<input
  placeholder="Navn"
  value={newName}
  onChange={(e) => setNewName(e.target.value)}
  style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
/>

<input
  placeholder="E-mailadresse"
  value={newEmail}
  onChange={(e) => setNewEmail(e.target.value)}
  style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
/>

<input
  type="password"
  placeholder="Adgangskode"
  value={newPassword}
  onChange={(e) => setNewPassword(e.target.value)}
  style={{ width: "100%", marginBottom: "20px", padding: "8px" }}
/>

<input
  type="password"
  placeholder="Gentag adgangskode"
  value={repeatPassword}
  onChange={(e) => setRepeatPassword(e.target.value)}
  style={{ width: "100%", marginBottom: "20px", padding: "8px" }}
/>

<select
  value={newRole}
  onChange={(e) => setNewRole(e.target.value)}
  style={{ width: "100%", marginBottom: "20px", padding: "8px" }}
>
  <option value="monitor">Monitor</option>
  <option value="admin">Admin</option>
</select>

<div style={{ display: "flex", justifyContent: "space-between" }}>

<button
  onClick={() => setShowUserModal(false)}
  style={{
    padding: "8px 14px",
    background: "#ccc",
    border: "none",
    borderRadius: "6px"
  }}
>
  Annuller
</button>

<button
  onClick={() => {
    createUser();
    setShowUserModal(false);
  }}
  style={{
    padding: "8px 14px",
    background: "#2ecc71",
    color: "white",
    border: "none",
    borderRadius: "6px"
  }}
>
  Opret
</button>

</div>

</div>
   </div>
   
    )}
    </>
)};


const ProtectedRoute = () => {
  const token =localStorage.getItem("token");

    return token ? <Outlet /> : <Navigate to="/login" replace />;
  };



function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks/new" element={<ServiceReportPage />} />
          <Route path="/tasks/:id" element={<ServiceReportPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;