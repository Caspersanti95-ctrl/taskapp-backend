const express = require("express");

const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const generateServiceReportHTML = require("../templates/serviceReportTemplate");
const htmlPdf = require("html-pdf-node");


module.exports = (io) => {
  const router = express.Router();

router.get("/:id/pdf", authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query(
            "SELECT * FROM tasks WHERE id = ? AND organization_id = ?",
            [id, req.user.organization_id]
        );

        if(rows.length ===0) {
            return res.status(404).json({ message: "Task not found" });
        }

        const task = rows[0];

        if (!task.approved) {
            return res.status(403).json({
                message: "Opgaven skal godkendes før PDF kan genereres"
            });
        }

        const html = generateServiceReportHTML(task);
        const file = { content: html };

        const pdfBuffer = await htmlPdf.generatePdf(file, {
            format: "A4"
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=service-report-${id}.pdf`
        );

        res.send(pdfBuffer);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
  });

    router.use(authMiddleware);

    router.get('/stats', async (req, res) => {
        try {
            const [rows] = await db.query(
                'SELECT status, COUNT(*) as count FROM tasks WHERE organization_id = ? GROUP BY status'
            );

            res.json(rows);

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server Fejl" });
        }
    });

    router.get('/stats/year', async (req, res) => {
        const { year } = req.query;
        try {
            const [rows] = await db.query(
                `SELECT 
                COUNT(*) as total, 
                SUM(CASE WHEN status = 'Godkendt' THEN 1 ELSE 0 END) as approved
                FROM tasks
                WHERE YEAR(created_at) = ? AND organization_id = ?
                `, [year, req.user.organization_id]);

            res.json(rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server Fejl" });
        }
    });



  router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {

        const [rows] = await db.query(
            "SELECT id, customer, address, service_date AS date, equipment_type AS type, fabrikat, serienr, remarks, technician, approved, equipment_approved, control_points FROM tasks WHERE id = ? AND organization_id = ?",
            [id, req.user.organization_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Opgave ikke fundet" });
        }

        if (rows[0].control_points) {
            try {
                rows[0].controlPoints = 
                typeof rows[0].control_points === "string"
                ? JSON.parse(rows[0].control_points)
                : rows[0].control_points;
            } catch (e) {
                rows[0].controlPoints = [];
        }
     }


        res.json(rows[0]);

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message });
    }
 });  

  router.get("/protected", (req, res) => {
    res.json({ 
        message: "Du har adgang!",
        user: req.user
    });
});

  router.get('/', async (req, res) => {
    try {
            const { status } = req.query;
        let query = "";
        let params = [];

            query = 'SELECT * FROM tasks WHERE assigned_to = ?';
            params = [req.user.id]; 

                // Filtering på status for både admin og almindelige brugere
        if (status) {
            query+=  ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY status, created_at DESC';

    const [rows] = await db.query(query, params);

    res.json(rows);
    }
    catch (err) {
        console.error("FEJL HENTNING AF OPGAVER:", err);
        res.status(500).json({ error: "Server Fejl" });
        }
    });

  router.post('/', authMiddleware, async (req, res) => {
    console.log("REQ.USER:", req.user);

    try {

        console.log("BODY:", req.body);

        const rawDate = req.body.date;
        const formattedDate = req.body.date && req.body.date !== "" 
            ? new Date(rawDate).toISOString().split("T")[0] 
            : new Date().toISOString().split("T")[0];

    const [result] = await db.query(
      `INSERT INTO tasks( 
                customer, 
                address, 
                service_date, 
                equipment_type, 
                fabrikat, 
                serienr, 
                remarks, 
                technician, 
                control_points, 
                equipment_approved, 
                status, 
                organization_id,
                approved_by,
                assigned_to
                )
       VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ 
        req.body.customer || "", 
        req.body.address || "", 
        formattedDate,
        req.body.type || "",
        req.body.fabrikat || "" ,
        req.body.serienr || "",
        req.body.remarks || "",
        req.body.technician || "",

        typeof req.body.control_points === "string"
        ? req.body.control_points
        : JSON.stringify(req.body.control_points || []),

        req.body.equipment_approved || "no",
        "Oprettet",
        req.user.organization_id,
        null,
        req.user.id 
      ]
    );

    io.emit('taskUpdated');

    res.json({ id: result.insertId });

  } catch (err) {
    console.error("SERVER ERROR FULL:", err);
    console.error("SERVER ERROR MESSAGE:", err.message);
    console.error("SQL:", err.sql);
    console.error("SQL MESSAGE:", err.sqlMessage);
    console.error(err);
    res.status(500).json({ error: "Kunne ikke oprette opgave" });
  }
});

  router.put('/:id', authMiddleware, async (req, res) => {
   try {
    const { id } = req.params;

    const [rows] = await db.query(
        "SELECT approved FROM tasks WHERE id = ? AND organization_id = ?",
        [id, req.user.organization_id]
    );

    if (!rows.length) {
        return res.status(404).json({ error: "Opgave ikke fundet"});
    }

    if (rows[0].approved === 1) {
        return res.status(403).json({ error: "Skemaet er låst" });
    }
console.log("equipment approved:", req.body.equipment_approved);

    const formattedDate = req.body.date
        ? new Date(req.body.date).toISOString().split("T")[0]
        : null;
        console.log("BODY:", req.body);
    await db.query(
        `UPDATE tasks SET
            customer = ?,
            address = ?,
            service_date = ?,
            equipment_type = ?,
            fabrikat = ?,
            serienr = ?,
            remarks = ?,
            technician = ?,
            control_points = ?,
            equipment_approved = ?
        WHERE id = ?`,
    [
        req.body.customer || "",
        req.body.address ?? null,
        formattedDate,
        req.body.type ?? null,
        req.body.fabrikat ?? null,
        req.body.serienr ?? null,
        req.body.remarks ?? null,
        req.body.technician ?? null,

        typeof req.body.control_points === "string" 
        ? req.body.control_points
        :JSON.stringify(req.body.control_points || []),

        req.body.equipment_approved ?? null,
        id,
    ]);

    res.json({ success: true });
    } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: "Kunne ikke opdatere opgave" });
    }

  });

  router.put('/:id/start', authMiddleware, async (req, res) => {
        const taskId = req.params.id;

        const [rows] = await db.query(
            "SELECT approved FROM tasks WHERE id = ? AND organization_id = ?",
            [taskId, req.user.organization_id]
        );

        if(!rows.length) {
            return res.status(404).json({ error: "Opgave ikke fundet" });
        } 

        if(rows[0].approved) {
            return res.status(400).json({ error: "Opgaven er allerede godkendt"});
        }

    await db.query(
      `UPDATE tasks SET status='I gang', started_at=NOW() WHERE id=? AND organization_id = ?`,
      [req.params.id, req.user.organization_id]
    );
    io.emit('taskUpdated');
    res.sendStatus(200);
  });

  router.put('/:id/complete',authMiddleware, async (req, res) => {
    try {
        const taskId = req.params.id;

        const [rows] = await db.query(
            "SELECT approved FROM tasks WHERE id = ? AND organization_id = ?",
            [taskId, req.user.organization_id]
        );

        if(!rows.length) {
            return res.status(404).json({ error: "Opgave ikke fundet" });
        } 

        if(rows[0].approved) {
            return res.status(400).json({ error: "Opgaven er allerede godkendt"});
        }

        await db.query(
        `UPDATE tasks SET status='Afsluttet', complete_at = NOW() WHERE id=? AND organization_id = ?`,
        [req.params.id, req.user.organization_id]
        );

        io.emit('taskUpdated');
    res.json({ message: "Opgave Afsluttet" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Fejl" });
    }
  });

  router.post('/:id/approve', authMiddleware, async (req, res) => {
        try {
            const taskId = req.params.id;
            const userId = req.user.id;
            
            const formattedDate = req.body.date
                ? new Date(req.body.date).toISOString().split("T")[0]
                : null;

            const [rows] = await db.query(
                "SELECT approved FROM tasks WHERE id = ? AND organization_id = ?",
                [taskId, req.user.organization_id]
            );

            if(!rows.length) {
                return res.status(404).json({ error: "Opgave ikke fundet" });
            } 

            if(rows[0].approved) {
                return res.status(400).json({ error: "Opgaven er allerede godkendt"});
            }

            const [result] = await db.query(
            `UPDATE tasks 
            SET approved = 1, 
                status = 'Godkendt',
                service_date = COALESCE(?, service_date),
                equipment_type = COALESCE(?, equipment_type),
                approved_by = ?,
                approved_at = NOW()
            WHERE id=? AND organization_id = ?
            `,
            [
            formattedDate,
            req.body.type || null,
            userId, 
            taskId,
            req.user.organization_id
        ]
        );

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    error: "Opgave ikke fundet" 
                });
            }

            io.emit('taskUpdated');

        res.json({ message: "Opgave Godkendt" });   
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server Fejl" });
        }
    });

    router.put('/:id/unapprove', authMiddleware, 
        roleMiddleware('admin'),
        async (req, res) => {
            try {
                const taskId = req.params.id;

                const [rows] = await db.query(
                    "SELECT approved FROM tasks WHERE id = ? AND organization_id = ?",
                    [taskId, req.user.organization_id]
                );
    
                if(!rows.length) {
                    return res.status(404).json({ error: "Opgave ikke fundet" });
                } 
    
                if(!rows[0].approved) {
                    return res.status(400).json({ error: "Opgaven er ikke låst"});
                }

                await db.query(
                    `
                    UPDATE tasks
                    SET approved = 0,
                        status = CASE
                                 WHEN status = 'Godkendt' THEN 'I gang'
                                 ELSE status
                                END,
                        approved_by = NULL,
                        approved_at = NULL
                    WHERE id = ? AND organization_id = ?
                    `,
                    [taskId, req.user.organization_id]
                );

                io.emit("taskUpdated");

                res.json({ message: "Opgave låst op" });
            }   catch (err) {
                console.error(err);
                res.status(500).json({ error: "Server fejl" });
            }
        });

        
        //Opret Task
        router.post('/tasks', authMiddleware, async (req, res) => {
            try {
                const { title } = req.body;

                await db.query(
                    "INSERT INTO tasks (title, user_id) VALUES (?, ?)",
                    [title, req.user.id]
                );

                res.json({ success: true });
            } catch (err) {
                console.error("CREATE TASK ERROR:", err);
                res.status(500).json({ error: "Kunne ikke oprette opgave" });
            }
        }
        );

        //Hent Task (kun brugerens egne)
        router.get('/tasks', authMiddleware, async (req, res) => {
            try {
                const tasks = await db.query(
                    "SELECT * FROM tasks WHERE user_id = ?",
                    [req.user.id]
                );

                res.json(tasks);
            } catch (err) {
                console.error("FETCH TASKS ERROR:", err);
                res.status(500).json({ error: "Kunne ikke hente opgaver" });
            }
        }
        );


  return router;
};
