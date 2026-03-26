require("dotenv").config();

console.log("SERVER SECRET:", process.env.JWT_SECRET);

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors({
  origin: "https://taskapp-client-xi.vercel.app",
  credentials: true,

}));

app.options('/*', cors());

app.use(express.json());

app.use('/tasks', require('./routes/tasks')(io))
app.use('/auth', require('./routes/authRoutes'));

io.on('connection', () => {
  console.log('Bruger forbundet');
});

server.listen(4000, () => console.log('Server kører på port 4000'));
