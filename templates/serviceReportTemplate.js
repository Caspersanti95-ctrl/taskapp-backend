const generateServiceReportHTML = (task) => {
    const today = new Date().toLocaleDateString("da-DK");

    const controlPoints =[
        "Hydraulik system",
        "Elektrisk Installation",
        "Sikkerhedsfunktioner",
        "Kontrolpanel og Display",
        "Smøring og bevægelige dele",
        "Fastgørelser og beslag",
        "Visuel inspektion",
        "Funktionsafprøvning"
    ];

    const generateRows = () => {
        return controlPoints.map(point => {
            const status = task[point] || "";
            return `
            <tr>
                <td class="left">${point}</td>
                <td>${status === "OK" ? "X" : ""}</td>
                <td>${status === "DEFEKT" ? "X" : ""}</td>
                <td>${status === "IKKE RELEVANT" ? "X" : ""}</td>
                </tr>
            `;
        }).join("");
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <style>
            
            @page {
                size: A4;
                margin: 20mm;
            }

            body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #000;
            }

            .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            }

            .logo {
            height: 60px;
            }

            .title {
            font-size: 22px;
            font-weight: bold;
            }

            .info-grid {
            dispaly: grid;
            grid-template-colums: 1fr 1fr;
            gap: 5px 40px;
            margin-bottom: 20px;
            }

            .label {
            font-weight: bold;
            }

            table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            }

            th, td {
            border: 1px solid #000;
            padding: 6px;
            text-align: center;
            }

            th {
            background-color: #f2f2f2;
            }

            .left {
            text-align: left;
            }

            .remarks {
            margin-top: 30px;
            }

            .signature {
            margin-top: 60px;
            }

            .line {
            border-bottom: 1px solid #000;
            margin-top: 40px;
            width: 250px;
            }

            .footer {
            margin-top: 40px;
            font-size: 10px;
            text-align: center;
            color: #666;
            }

            </style>
            </head>
            <body>

            <div class="header">
            <img scr"file:///${__dirname}/../assets/logo.png" class="logo" />
            <div class="title">Service & Vedligeholdesskema</div>
            </div>

            <div class="info-grid">
                <div><span class="label">Opgave ID:</span> ${task.id}</div>
                <div><span class="label">Dato:</span> ${today}</div>
                <div><span class="label">Kunde:</span> ${task.customer || ""}</div>
                <div><span class="label">Adresse:</span> ${task.address || ""}</div>
                <div><span class="label">Tekniker:</span> ${task.technician || ""}</div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th class="left">Kontrolpunkt</th>
                        <th>OK</th>
                        <th>Defekt</th>
                        <th>Ikke relevant</th>
                    </tr>
                </thead>
                    <tbody>
                        ${generateRows()}
                    </tbody>
            </table>

            <div class="remarks">
             <div class="label">Bemærkninger:</div>
             <div>${task.remarks || ""}</div>
            </div>

            <div class="signature">
             <div class="label">Underskrift:</div>
             <div class="line"></div>
            </div>

            <div class="footer">
                Serviceman * Telefon 60 24 09 70
            </div>

            </body>
        </html>
    `;
};

module.exports = generateServiceReportHTML;