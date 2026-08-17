require("dotenv").config();

// Import the database connection pool
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const propertiesRouter = require("./routes/properties");
const openHousesRouter = require("./routes/openhouses");

const app = express();

// Middleware
app.use(cors());
// Parse JSON bodies
app.use(express.json());

// Log every completed request with its final status and elapsed time.
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    console.log(
      `${timestamp} ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(2)}ms`
    );
  });

  next();
});

app.use("/api/properties", propertiesRouter);
app.use("/api/openhouses", openHousesRouter);

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "IDX Exchange backend is running",
    health: "/api/health",
  });
});

// Health check route to verify database connection
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      message: "Database connection failed",
    });
  }
});

// Start the server
// Port 5000 is commonly occupied by AirPlay Receiver on macOS.
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || "127.0.0.1";

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
