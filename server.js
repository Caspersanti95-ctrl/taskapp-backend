require("dotenv").config();

console.log("SERVER SECRET:", process.env.JWT_SECRET);

const express = require('express');
const cors = require('cors');
const stripeRoutes = require('./routes/stripe');
const webhookRoute = require('./routes/webhook');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://taskapp-client-xi.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});
const db = require('./db');

(async () => {
  try {
    const [rows] = await db.query("SHOW COLUMNS FROM tasks LIKE 'approved_by'");
    console.log("CHECK COLUMN:", rows);
  } catch (err) {
    console.error("CHECK ERROR:", err);
  }
} )();
const uploadRoute = require("./uploadRoute");
const authMiddleware = require("./middleware/authMiddleware");

app.use(cors({
  origin:  [ 
    "https://taskapp-client-xi.vercel.app",
    "https://www.lucache.com",
    "https://lucache.com"
  ],
  credentials: true,

}));


app.use('/', webhookRoute);
app.use(express.json());

app.use("/company", authMiddleware, uploadRoute);

app.use('/tasks', require('./routes/tasks')(io))
app.use('/auth', require('./routes/authRoutes'));
app.use('/stripe', stripeRoutes);


io.on('connection', () => {
  console.log('Bruger forbundet');
});

server.listen(4000, () => console.log('Server kører på port 4000'));
