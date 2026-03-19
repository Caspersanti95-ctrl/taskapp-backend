const mysql = require('mysql2');

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Root9593",
  database: "taskapp_db",
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool.promise();
