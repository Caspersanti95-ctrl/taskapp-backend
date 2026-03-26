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
  origin: "https://taskapp-client-xi.vercel.app",
  credentials: true,

}));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://taskapp-client-xi.vercel.app");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(express.json());

app.use('/tasks', require('./routes/tasks')(io))
app.use('/auth', require('./routes/authRoutes'));

io.on('connection', () => {
  console.log('Bruger forbundet');
});

server.listen(4000, () => console.log('Server kører på port 4000'));
