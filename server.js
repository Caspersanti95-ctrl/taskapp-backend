require("dotenv").config();

console.log("SERVER SECRET:", process.env.JWT_SECRET);

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors({
  origin: ["http://localhost:5173",
    "https://taskapp-client-cel5iv1sf-caspersanti95-6943s-projects.vercel.app/login"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

app.use('/tasks', require('./routes/tasks')(io))
app.use('/auth', require('./routes/authRoutes'));

io.on('connection', () => {
  console.log('Bruger forbundet');
});

server.listen(4000, () => console.log('Server kører på port 4000'));
