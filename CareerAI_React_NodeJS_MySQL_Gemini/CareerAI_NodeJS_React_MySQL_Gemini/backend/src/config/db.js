import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = process.env.DATABASE_URL
  ? mysql.createPool(process.env.DATABASE_URL)
  : mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "career_ai_db",
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true
    });
export default pool;
