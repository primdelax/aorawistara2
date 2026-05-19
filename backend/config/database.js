const mysql2 = require("mysql2/promise");
require("dotenv").config();

const pool = mysql2.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "aora_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+07:00",
});

const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ MySQL Connected: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
    connection.release();
  } catch (error) {
    console.error("❌ MySQL Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
