import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// MS SQL Config
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
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: true // For dev
  }
};

// Database connection pool
let pool: sql.ConnectionPool | null = null;

async function getPool() {
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

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Customers
app.get("/api/customers", async (req, res) => {
  try {
    const dbPool = await getPool();
    const result = await dbPool.request().query("SELECT * FROM Customers ORDER BY Name");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

app.post("/api/customers", async (req, res) => {
  const { name, email, phone, address } = req.body;
  try {
    const dbPool = await getPool();
    await dbPool.request()
      .input("name", sql.NVarChar, name)
      .input("email", sql.NVarChar, email)
      .input("phone", sql.NVarChar, phone)
      .input("address", sql.NVarChar, address)
      .query("INSERT INTO Customers (Name, Email, Phone, Address) VALUES (@name, @email, @phone, @address)");
    res.status(201).json({ message: "Customer created" });
  } catch (err) {
    res.status(500).json({ error: "Failed to create customer" });
  }
});

// Surat Jalan (Delivery Orders)
app.get("/api/surat-jalan", async (req, res) => {
  try {
    const dbPool = await getPool();
    const result = await dbPool.request().query(`
      SELECT sj.*, c.Name as CustomerName 
      FROM SuratJalan sj 
      JOIN Customers c ON sj.CustomerId = c.Id 
      ORDER BY sj.Date DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch surat jalan" });
  }
});

// Invoices
app.get("/api/invoices", async (req, res) => {
  try {
    const dbPool = await getPool();
    const result = await dbPool.request().query(`
      SELECT i.*, c.Name as CustomerName 
      FROM Invoices i 
      JOIN Customers c ON i.CustomerId = c.Id 
      ORDER BY i.Date DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
