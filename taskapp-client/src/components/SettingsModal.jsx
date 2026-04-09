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
  saveUser,
  isEditing,
  setIsEditing,

  // edit fields
  editedName, setEditedName,
  editedEmail,
  editedPhone, setEditedPhone,
  editedRole, setEditedRole,
  editedPassword, setEditedPassword,
  repeatEditedPassword, setRepeatEditedPassword
}) {

  const [tab, setTab] = useState(null);

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
              <img src={u.logo} style={{ width: "100%" }} />
            )}

            <input type="file" onChange={(e) => setSelectedLogo(e.target.files[0])} />

            <button
              onClick={() => handleLogoUpload(selectedLogo)}
              disabled={!selectedLogo}
            >
              Gem Logo
            </button>

            <button onClick={deleteLogo}>Slet Logo</button>

            <button onClick={() => setTab(null)}>Tilbage</button>
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
            <h3>Medarbejdere</h3>

            {users.map((u) => (
              <div key={u.id} onClick={() => startEdit(u)}>
                {u.name} ({u.role})

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteUser(u.id);
                  }}
                >
                  Slet
                </button>
              </div>
            ))}

            {/* EDIT USER */}
            {editingUser && (
              <>
                <h4>Rediger</h4>

                <input value={editedName} onChange={(e) => setEditedName(e.target.value)} />
                <input value={editedEmail} disabled />

                <input value={editedPhone} onChange={(e) => setEditedPhone(e.target.value)} />

                <select value={editedRole} onChange={(e) => setEditedRole(e.target.value)}>
                  <option value="monitor">Monitor</option>
                  <option value="admin">Admin</option>
                </select>

                <input
                  type="password"
                  placeholder="Nyt password"
                  value={editedPassword}
                  onChange={(e) => setEditedPassword(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="Gentag password"
                  value={repeatEditedPassword}
                  onChange={(e) => setRepeatEditedPassword(e.target.value)}
                />

                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)}>Rediger</button>
                ) : (
                  <button onClick={saveUser}>Gem</button>
                )}

                <button onClick={() => setIsEditing(false)}>Annuller</button>
              </>
            )}

            <button onClick={() => setTab(null)}>Tilbage</button>
          </>
        )}

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
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modal = {
  background: "#0f172a",
  padding: "20px",
  borderRadius: "12px",
  width: "400px",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};