import React, { useState } from "react";


export default function SettingsModal({
  onClose,
  

  // logo
  user,
  selectedLogo,
  setSelectedLogo,
  handleLogoUpload,
  deleteLogo,
  


  // create user
  newName, setNewName,
  newEmail, setNewEmail,
  newPassword, setNewPassword,
  repeatPassword, setRepeatPassword,
  newPhone, setNewPhone,
  newRole, setNewRole,
  createUser,
  loadingCreate,

  // users
  users,
  startEdit,
  deleteUser,
  editingUser,
  setEditingUser,
  saveUser,
  isEditing,
  setIsEditing,
  handleEdit,
  handleCancel,

  // edit fields
  editedName, setEditedName,
  editedEmail,
  editedPhone, setEditedPhone,
  editedRole, setEditedRole,
  editedPassword, setEditedPassword,
  repeatEditedPassword, setRepeatEditedPassword,
  loadingSave, 
}) {

  const [tab, setTab] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  return (
    <div style={overlay}>
      <div style={modal}>

        {!tab && (
          <>
            <h2>Indstillinger</h2>

            <button onClick={() => setTab("logo")}>Logo</button>
            <button onClick={() => setTab("create")}>+ Opret Medarbejder</button>
            <button onClick={() => setTab("users")}>👥 Medarbejdere</button>
          </>
        )}

        {/* LOGO */}
        {tab === "logo" && (
          <>
            <h3>Logo</h3>

            {user?.logo && (
              <img src={user?.logo} style={{ width: "100%" }} />
            )}

            <input type="file" onChange={(e) => setSelectedLogo(e.target.files[0])} />

            <button
              onClick={() => handleLogoUpload(selectedLogo)}
              disabled={!selectedLogo}
              onMouseEnter={(e) => e.target.style.background = "#16a34a"}
              onMouseLeave={(e) => e.target.style.background = "#1e293b"}
              style={{
                ...buttonStyle,
                background: "#1e293b",
                color: "white",
                opacity: loadingSave ? "0.7" : "1",
                cursor: loadingSave ? "not-allowed" : "pointer"
                }}
            >
              {loadingSave ? "Gemmer..." : "Gem"}
            </button>

            <button onClick={deleteLogo}
                    onMouseEnter={(e) => e.target.style.background = "#ef4444"}
                    onMouseLeave={(e) => e.target.style.background = "#1e293b"}
                    style={{
                        ...buttonStyle,
                        background: "#1e293b",
                        color: "white"
                        }}
                    >
                        Slet Logo
                    </button>

            <button onClick={() => setTab(null)}
                        onMouseEnter={(e) => e.target.style.background = "#2563eb"}
                        onMouseLeave={(e) => e.target.style.background = "#1e293b"}
                        style={{
                        ...buttonStyle,
                        background: "#1e293b",
                        color: "white"
                        }}
                    >
                        Tilbage
                    </button>
          </>
        )}

        {/* CREATE USER */}
        {tab === "create" && (
          <>
            <h3>Opret medarbejder</h3>

            <input placeholder="Navn" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <input placeholder="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            <input placeholder="Telefon" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />

            <input type="password" placeholder="Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <input type="password" placeholder="Gentag password" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} />

            <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
              <option value="monitor">Monitor</option>
              <option value="admin">Admin</option>
            </select>

            <button onClick={createUser} disabled={loadingCreate}>
              {loadingCreate ? "Loader..." : "Opret"}
            </button>

            <button onClick={() => setTab(null)}>Tilbage</button>
          </>
        )}

        {/* USERS */}
        {tab === "users" && ( 
            <>
            <h3 style={{ marginBottom: "10px" }}>Medarbejdere</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {users.map((u) => (
              <div 
                key={u.id} 
                onClick={() => startEdit(u)}
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    background: "#020617",
                    border: "1px solid #1e293b",
                    cursor: "pointer",
                    transition: "0.2s"
                }}
                onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#0f172a")
                }
                onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#020617")
                }
                >
                    {/* FRA VENSTRE */}
                <div>
                <div style={{ fontWeight: "600" }}>
                {u.name || u.username} 
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                {u.email}
                </div>
                </div>

                {/* HØJRE */}
                <div style={{display: "flex", alignItems: "center", gap: "10px"}}>

                    {/* ROLLE */}
                <span 
                    style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        background:
                            u.role === "admin" ? "#22c55e22" : "#3b82f622",
                         color:
                            u.role === "admin" ? "#22c55e" : "#3b82f6"
                    }}
                    >
                        {u.role}
                    </span>

                    {/* DELETE Medarbejder */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteUser(u.id);
                  }}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#ef4444",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                  onMouseEnter={(e) =>
                  (e.currentTarget.style.opacity = "0.8")
                  }
                  onMouseLeave={(e) =>
                  (e.currentTarget.style.opacity = "1")
                  }
                >
                  Slet
                </button>
              </div>
           </div>
           
            ))}
            </div>
            </>
        )}
            

            {/* EDIT USER */}
            {editingUser && (
              <>
              <div style={overlay}>
                <div style={modal}>
                <h3
                    style={{
                        marginBottom: "10px",
                        fontSize: "20px",
                        fontWeight: "600"
                    }}
                >
                    Medarbejder informationer
                </h3>

            <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                <input 
                    type="text"
                    placeholder="Navn"
                    value={editedName}
                    disabled={!isEditing} 
                    onChange={(e) => setEditedName(e.target.value)}
                    style={inputStyle}
                     />

                <input 
                    type="email"
                    value={editedEmail || editingUser.email ||""} 
                    disabled
                    style={{
                        ...inputStyle,
                        opacity: "0.7",
                        cursor: "not-allowed"
                        }}
                     />

                <input 
                    type="text"
                    placeholder="Telefon"
                    value={editedPhone} 
                    disabled={!isEditing}
                    onChange={(e) => setEditedPhone(e.target.value)}
                    style={inputStyle}
                     />

                <select value={editedRole} onChange={(e) => setEditedRole(e.target.value)}
                    style={inputStyle}
                    >
                  <option value="monitor">Monitor</option>
                  <option value="admin">Admin</option>
                </select>

                <input
                  type="password"
                    disabled={!isEditing}
                  placeholder="Nyt password"
                  value={editedPassword}
                  onChange={(e) => setEditedPassword(e.target.value)}
                  style={inputStyle}
                />

                <input
                  type="password"
                    disabled={!isEditing}
                  placeholder="Gentag password"
                  value={repeatEditedPassword}
                  onChange={(e) => setRepeatEditedPassword(e.target.value)}
                  style={inputStyle}
                />
            </div>

                {!isEditing ? (
                    <>
                  <button onClick={handleEdit}
                        onMouseEnter={(e) => e.target.style.background = "#2563eb"}
                        onMouseLeave={(e) => e.target.style.background = "#1e293b"}
                        style={{
                            ...buttonStyle,
                            background: "#1e293b",
                            color: "white"
                            }}
                  >
                    Rediger
                  </button>
                 
                  <button onClick={() => {
                    setIsEditing(false);
                    setEditingUser(null);
                    }}
                        onMouseEnter={(e) => e.target.style.background = "#2563eb"}
                        onMouseLeave={(e) => e.target.style.background = "#1e293b"}
                        style={{
                        ...buttonStyle,
                        background: "#1e293b",
                        color: "white"
                        }}
                    >
                        Tilbage
                        </button>
                  </>
                
            ) : (
                    <>
                    <button onClick={saveUser}
                        onMouseEnter={(e) => e.target.style.background = "#16a34a"}
                        onMouseLeave={(e) => e.target.style.background = "#1e293b"}
                        style={{
                            ...buttonStyle,
                            background: "#1e293b",
                            color: "white",
                            opacity: loadingSave ? "0.7" : "1",
                            cursor: loadingSave ? "not-allowed" : "pointer"
                            }}
                    >
                       {loadingSave ? "Gemmer..." : "Gem"}
                    </button>

                <button onClick={handleCancel}
                        onMouseEnter={(e) => e.target.style.background = "#ef4444"}
                        onMouseLeave={(e) => e.target.style.background = "#1e293b"}
                        style={{
                            ...buttonStyle,
                            background: "#1e293b",
                            color: "white"
                            }}
                    >
                    Annuller
                </button>
                </>
            )}

           </div>
        </div> 
          </>
        )}
       
      

        <button onClick={onClose}
                onMouseEnter={(e) => e.target.style.background = "#ef4444"}
                onMouseLeave={(e) => e.target.style.background = "#1e293b"}
                style={{
                    ...buttonStyle,
                    background: "#1e293b",
                    color: "white",
                    }}
        >
            Luk
        </button>

        </div>
    </div>
  )};



const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(8px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2000
};

const modal = {
  background: "linear-gradient(145deg, #0f172a, #020617)",
  padding: "30px",
  borderRadius: "18px",
  width: "420px",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  boxShadow: "0 25px 80px rgba(0, 0, 0, 0.6)",
  border: "1px solid #1e293b"
};

const inputStyle = {
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #1e293b",
  background: "#020617",
  color: "white",
  width: "100%",
  outline: "none",
  transition: "0.2s"
};

const buttonStyle = {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    transition: "0.2s",
};
