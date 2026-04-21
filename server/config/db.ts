import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER || "",
  port: parseInt(process.env.DB_PORT || "1433"),
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

let pool: sql.ConnectionPool | null = null;

export async function getPool() {
  if (!pool) {
    try {
      pool = await sql.connect(sqlConfig);
      console.log("Connected to MS SQL");
    } catch (err) {
      console.error("Database connection failed:", err);
      throw err;
    }
  }
  return pool;
}

export { sql };
