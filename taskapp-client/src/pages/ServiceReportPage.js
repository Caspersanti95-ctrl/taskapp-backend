import { useParams } from "react-router-dom";
import api from "../api";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { getRole } from "../utils/auth";


function ServiceReportPage() {
    const {id} = useParams();
    const navigate = useNavigate();
    const isAdmin = getRole() === "admin";
    const [isSavingDisabled, setIsSavingDisabled] = useState(false);
    const saveTimeout = useRef(null);

    
    

    const [formData, setFormData] = useState({
        customer: "",
        address: "",
        date: "",
        type: "",
        fabrikat: "",
        serienr: "",
        approved: 0,
        remarks:"",
        technician:"",
        equipment_approved: ""
    });

    const mapTask = (task) => ({
        ...task,
        approved: Number(task.approved),
        date: (task.date || task.service_date || "").split("T")[0],
        type: task.type || task.equipment_type || "",
        equipment_approved: task.equipment_approved ?? null
    });

        useEffect(() => {
            console.log("equipment:", formData.equipment_approved);
        }, [formData.equipment_approved]);

    const isApproved = Number(formData.approved) === 1;


    const controlPointsList = useMemo(() => [
        "Funktions test af betjeningspanel / håndtag",
        "Visuel kontrol af Produktet",
        "Kontrol af Hydraulik, Luft og El-forbindelser",
        "Kontrol af nødstop & sikkerhedsfunktioner",
        "Smøring af bevægelige dele",
        "Søjler står i lod",
        "Afsluttende funktionskontrol"
    ], []);

    const [controlPoints, setControlPoints] = useState(
        controlPointsList.map(point => ({
            name: point,
            status: ""
        }))
    );

    const handleStatusChange = (index, value) => {
        const updated = [...controlPoints];
        updated[index].status = value;
        setControlPoints(updated);
    };

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        console.log("INPUT CHANGE:", name, value); 
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const saveTask = async () => {

        
        try{
            const data = formData;

            const payload = {
                customer: formData.customer || "",
                address: formData.address || "",
                date: formData.date || "",
                type: formData.type || "",
                fabrikat: formData.fabrikat || "",
                serienr: formData.serienr || "",
                remarks: formData.remarks || "",
                technician: formData.technician || "",
                equipment_approved: formData.equipment_approved || "",
                control_points: JSON.stringify(controlPoints || [])
            };
console.log("CLICKED SAVE", payload);
        if (!id || id === "new") {
             const res = await api.post("/tasks", payload);

                console.log("Opgave Oprettet", res.data);

            navigate(`/tasks/${res.data.id}`);

            
            
        } else {
            
            await api.put(`/tasks/${id}`, payload);
            
        }
        
        
     } catch (err) {
            console.error("SAVE ERROR", err);
        }
    };

    const handleApprove = async () => {
        try {

            setIsSavingDisabled(true);

        const today = new Date().toISOString().split("T")[0];
            
        await api.put(`/tasks/${id}/approve`, {
            approved: 1,
            date: formData.date ? formData.date.split("T")[0] : today,
            type: formData.type
        });

        const res = await api.get(`/tasks/${id}`);

        setFormData(mapTask(res.data));

       

    } catch (err) {
        console.error(err);
    }
};

    const handleUnlock = async () => {
        try {
            await api.put(`/tasks/${id}/unapprove`, {
                approved: 0
            });
            
            const res = await api.get(`/tasks/${id}`);

            setFormData({
                ...mapTask(res.data),
                approved: 0
            });

            setIsSavingDisabled(false);

            

        } catch (err) {
            console.error(err);
        }                
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        // Hvis det er NEW -> hent ikke noget
        if (id === "new") {
            setFormData({
                customer: "",
                address: "",
                date: "",
                type: "",
                fabrikat: "",
                serienr: "",
                approved: 0,
                remarks: "",
                technician: "",
                equipment_approved: "no"
            });
            return;
        }

        // Ellers hent eksisterende opgave
        api.get(`/tasks/${id}`)     
        .then(res => {
            setFormData(mapTask(res.data));

            if (res.data.control_points && res.data.control_points !== "[]") {
                setControlPoints(
                    typeof res.data.control_points === "string"
                    ? JSON.parse(res.data.control_points)
                    : res.data.control_points
                );
            } else {
                setControlPoints(
                    controlPointsList.map(point => ({
                        name: point,
                        status: ""
                    }))
                );
            }
                
        })
        .catch(err => {
            console.error(err);
        if (err.response?.status ===401) {
            navigate("/login");
        }
    });

    }, [id]);

    useEffect (() => {

        if (!id || id === "new") return;

        const fetchTasks = async () => {

            const res = await api.get(`/tasks/${id}`);

        };

        fetchTasks();
    }, [id]);

    useEffect (() => {
        if (!id || id === "new") return;

        if (isApproved || isSavingDisabled) return;

        clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(() => {
            saveTask();
        }, 500);

        return () => clearTimeout(saveTimeout.current);
    }, [formData, controlPoints, id, isApproved,isSavingDisabled]);


    if (!formData) return <div>loader...</div>;

    const downloadPDF = async () => {
        const element = document.getElementById("pdf-content");

        const opt = {
            margin:         0,
            filename:        `Service-rapport-${id || "ny"}.pdf`,
            image:          { type: 'jpeg', quality: 1 },
            html2canvas:    { scale: 2, 
                              useCORS: true,
                              ignoreElements: (element) => {
                                return (
                                    element.tagName === "INPUT" ||
                                    element.tagName === "TEXTAREA" ||
                                    element.tagName === "SELECT" ||
                                    element.tagName === "BUTTON"
                                );
                              }
                            },
            jsPDF:          { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    };

    return (
        <div style={pageStyle}>
           

            <div id="pdf-content" style={documentStyle}>

                <div style={{ textAlign: "center", marginBottom: "20px"}}>
                    <img src="/logo.png" style={{ height: "100px"}} />
                </div>

            <h1 style={{
                    textAlign: "center",
                    marginBottom: "60px",
                    fontSize: "24px",
                    fontWeight: "600"
                    }}>
                    Service & Vedligeholdelsesskema
             </h1>

            
            <div style={remarksStyle}>

                <div style={{ 
                    display:"flex",
                   
                    alignItems: "flex-end",
                    marginBottom: "30px" 
                    }}>

                    {/* Række 1 */}                   
                    <div style={{ display: "flex", alignItems: "flex-end" }}>
                        <span style={{ marginRight: "10px" }}>Kunde:</span>
                        {isApproved ? (
                            <span>{formData.customer}</span>
                        ) : (
                        <input name="customer"
                               value={formData.customer || ""}
                               onChange={handleInputChange}
                               style={{ border: "none",
                                        borderBottom: "1px solid black",
                                        width: "350px", 
                                        outline: "none",
                                        fontSize: "15px",
                                        fontFamily: "Times New Roman, serif"
                                        }} 
                                    />
                                    )}
                    </div>

                    <div style={{ display: "flex", alignItems:"center", gap: "10px", marginLeft: "355px" }}>
                    <span>Dato:</span>

                    {isApproved ? (
                        <span>{formData.date?.split("T")[0]}</span>
                    ) : (
                        <input type="date"
                               name="date"
                               value={formData.date || ""}
                               onChange={handleInputChange}
                               style={{ ...docInputInLine, width: "150" }} 
                               />
                    )} 
                    </div>
                </div>

                    {/* Række 2 */}
                    <div style={{ marginBottom: "30px", display: "flex", alignItems: "flex-end" }}>
                    <span style={{ marginRight: "10px" }}>Adresse:</span>

                    {isApproved ? (
                        <span>{formData.address}</span>
                    ) : (
                        <input name="address"
                               value={formData.address || ""}
                               onChange={handleInputChange}
                               style={{
                                        border: "none",
                                        borderBottom: "1px solid black",
                                        width: "600px",
                                        outline: "none",
                                        fontSize: "15px",
                                        fontFamily: "Times New Roman, serif"
                                }}
                         />
                         )}
                    </div>

                    {/* Række 3 */}
                    <div style={{ 
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "30px" 
                        }}>

                            {/* Type */}
                    <div style={{ display: "flex", alignItems: "flex-end"}}>
                        <span style={{ marginRight: "10px" }}>Type:</span>

                        {isApproved ? (
                            <span style={{ width: "150px", display: "inline-block"}}>
                                {formData.type}
                            </span>
                        ) : (
                        <input type="text"
                               name="type"
                               value={formData.type || ""}
                               onChange={handleInputChange}
                               style={{
                                        border: "none",
                                        borderBottom: "1px solid black",
                                        width: "200",
                                        outline: "none",
                                        fontSize: "15px",
                                        fontFamily: "Times New Roman, serif"
                                    }}
                            />
                         )}
                    </div>

                            {/* Fabrikat */}
                    <div style={{ display: "flex", alignItems: "flex-end" }}>
                        <span style={{ marginRight: "10px"}}>Fabrikat:</span>

                        {isApproved ? (
                            <span style={{ width: "200px", display: "inline-block"}}> 
                                {formData.fabrikat}
                            </span>
                        ) : (
                        <input name="fabrikat"
                               value={formData.fabrikat}
                               onChange={handleInputChange}
                               style={{
                                        border: "none",
                                        borderBottom: "1px solid black",
                                        width: "200px",
                                        outline: "none",
                                        fontSize: "15px",
                                        fontFamily: "Times New Roman, serif"
                                    }}
                            />
                        )}
                    </div>

                            {/* Serie Nr. */}
                    <div style={{ display: "flex", alignItems: "flex-end" }}>
                        <span style={{ marginRight: "10px", whiteSpace: "nowrap" }}>{"Serie nr.:"}</span>

                        {isApproved ? (
                            <span style={{ width: "200px", display: "inline-block"}}>
                                {formData.serienr}
                            </span>
                        ) : (
                        <input name="serienr"
                               value={formData.serienr}
                               onChange={handleInputChange}
                               style={{
                                        border: "none",
                                        borderBottom: "1px solid black",
                                        width: "200px",
                                        outline: "none",
                                        fontSize: "15px",
                                        fontFamily: "Times New Roman, serif"
                                    }}
                            />
                        )}
                    </div>
                    </div>

                   



            
                <h3 style={{ marginTop: "30px" }}>Kontrolpunkter</h3>
                
                <table style={tableStyle}>
  <thead>
    <tr>
      <th style={{ ...thStyle, textAlign: "left" }}>Kontrolpunkt</th>
      <th style={thStyle}>OK</th>
      <th style={thStyle}>Defekt</th>
      <th style={thStyle}>Udskiftet</th>
      <th style={thStyle}>Ikke relevant</th>
    </tr>
  </thead>

  <tbody>
    {controlPoints?.map((point, index) => (
      <tr key={index}>
        <td style={{ ...tdStyle, textAlign: "left" }}>
          {point.name}
        </td>

        <td style={tdStyle}>
            {isApproved ? (
                point.status === "ok" ? "✔︎" : ""
            ) : (
          <input
            type="radio"
            name={`status-${index}`}
            checked={point.status === "ok"}
            onChange={() => handleStatusChange(index, "ok")}
            disabled={isApproved}
          />
            )}
        </td>

        <td style={tdStyle}>
         {isApproved ? (
            point.status === "defect" ? "✔︎" : ""
         ) : (
          <input
            type="radio"
            name={`status-${index}`}
            checked={point.status === "defect"}
            onChange={() => handleStatusChange(index, "defect")}
            disabled={isApproved}
          />
        )}
        </td>

        <td style={tdStyle}>
          {isApproved ? (
            point.status === "replaced" ? "✔︎" : ""
          ) : (
          
          <input
            type="radio"
            name={`status-${index}`}
            checked={point.status === "replaced"}
            onChange={() => handleStatusChange(index, "replaced")}
            disabled={isApproved}
          />
          )}
        </td>

        <td style={tdStyle}>
          {isApproved ? (
            point.status === "not_relevant" ? "✔︎" : ""
          ) : (
          <input
            type="radio"
            name={`status-${index}`}
            checked={point.status === "not_relevant"}
            onChange={() => handleStatusChange(index, "not_relevant")}
            disabled={isApproved}
          />
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>


        <div style={{ marginTop: "30px", marginBottom: "40px" }}>
            <strong style={{ display: "block", marginBottom: "10px" }}>
                Bemærkninger:
            </strong>

            {isApproved ? (
                <div style={{ 
                            border: "none",
                            minHeight: "80px",                           
                            paddingBottom: "5px",
                            whiteSpace: "pre-wrap"
                             }}
                        >
                    
                     {formData.remarks}   
                    </div>
                ) : (
                    <textarea
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleInputChange}
                        disabled={isApproved}
                        style={{
                            width: "100%",
                            border: "1px solid black",                            
                            minHeight: "100px",
                            marginTop: "10px",
                            padding: "10px",
                            fontFamily: "Times New Roman, serif",
                            fontSize: "15px",
                            outline: "none"
                        }}
                    />
                )}
                    </div>
                   

                <div style={{ marginBottom: "20px" }}>
                    <strong>Udstyr godkendt:</strong>
                      
                      {isApproved ? (
                        <span style={{ marginLeft: "20px"}}>
                            
                            {formData.equipment_approved === "yes" ? "Ja" : "Nej"}
                        </span>
                      ) : (
                        <>
                        <span style={{ marginLeft: "20px" }}>
                            Ja 
                        <input 
                            type="radio"
                            name="equipment_approved"
                            value="yes"
                            checked={formData.equipment_approved === "yes"}
                            onChange={handleInputChange} 
                            />
                        </span>

                        <span style={{ marginLeft: "20px" }}>
                            Nej 
                        <input 
                            type="radio"
                            name="equipment_approved"
                            value="no"
                            checked={formData.equipment_approved === "no"}
                            onChange={handleInputChange}
                            />
                        </span>
                        </>
                      )}
                    </div>
                </div>
                        
                
                <div style={{ 
                              marginTop: "5px", 
                              display: "flex",
                              alignItems: "center",
                              gap: "8px"
                            }}
                        > 
                    <label>Udførende Tekniker:</label>

                      {isApproved ? (
                        
                            <span>{formData.technician}</span>                                                     
                 
                      ) : (
                        <input
                            name="technician"
                            value={formData.technician}
                            onChange={handleInputChange}
                            style={{
                                    border: "none",
                                    borderBottom: "1px solid black",
                                    width: "300px",
                                    marginTop: "10px",
                                    outline: "none",
                                    fontFamily: "inherit", 
                                    fontSize: "15px"  
                                }}
                            />
                        )}
                    </div>                
            

            <div 
                style={{
                    textAlign: "center"
                }}>
                
            {id && !isApproved && (
                <button
                    onClick={handleApprove}
                    style={{
                        backgroundColor: "#2e7d32",
                        color: "white",
                        padding: "10px 20px",
                        border: "none",
                        marginBottom: "20px",
                        cursor: "pointer"
                    }}
                >
                    Godkend Skema
                </button>
            )}
        </div>

            {isApproved && isAdmin && (
                <button
                    onClick={handleUnlock}
                    style={{
                        backgroundColor: "#2e7d32",
                        color: "white",
                        padding: "10px 20px",
                        border: "none",
                        marginBottom: "20px",
                        cursor: "pointer"
                    }}
                >
                    Lås op for skema
                </button>
            )}

            {id && isApproved && (
            <button onClick={downloadPDF} style={buttonStyle}>
                Download PDF
            </button>  
            )}

            {(!id || id === "new") && (
            <button 
                type="button"
                onClick={() => {
                    console.log("BUTTON CLICKED");
                    saveTask();
                }}
                style={{
                    padding: "10px 16px",
                    background: "#3498db",
                    color: "white",
                    borderRadius: "6px",
                    cursor: "pointer"
                }}
            >
                Opret Opgave
            </button>
            )}
        </div>
    </div> 
    
    );
}

export default ServiceReportPage;

const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
    marginBottom: "0px",
    fontSize:"14px",
    borderLeft: "1px solid black",
    borderRight: "1px solid black",
    borderTop: "1px solid black"
};

const thStyle = {
    borderBottom: "1px solid black",
    padding: "10px",
    textAlign: "center"
};

const tdStyle = {
    borderBottom: "1px solid black",
    padding: "8px",
    textAlign: "center"
};

const buttonStyle = {
    marginBottom: "20px",
    padding: "10px 20px",
    cursor: "pointer"
};

const pageStyle = {
    backgroundColor: "#f3f4f6",
    padding: "40px 0",
    display: "flex",
    justifyContent: "center"
  };
  
  const documentStyle = {
    backgroundColor: "white",
    width: "210mm",
    minHeight: "297mm",
    padding: "20mm",
    fontFamily: "Times New Roman, serif",
    fontSize: "15px",
    lineHeight: "1.8",
    color: "#111",
    boxSizing: "border-box"
  };
  
  const docInputInLine = {
    border: "none",
    borderBottom: "1px solid black",
    padding: "4px 0",
    background: "transparent",
    outline: "none",
    fontSize: "15px"
  };

  const remarksStyle = {
    width: "100%",
    border: "none",
    minHeight: "100px",
    marginTop: "10px",
    padding: "10px",
    resize: "none",
    outline: "none",
    fontFamily: "Times New Roman, serif",
    fontSize: "15px",
    boxSizing: "border-box"
  };

 

 