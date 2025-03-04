const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectionLimit: 100,
});

db.getConnection((err, connection) => {
    if (err) {
        // console.log("Error connecting to database", err);
    }
    else {
        // console.log("Connected to database");
        connection.release();
    }
})

module.exports = db;