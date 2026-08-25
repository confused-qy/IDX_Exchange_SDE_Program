require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");
const propertiesRouter = require("./routes/properties");
const openHousesRouter = require("./routes/openhouses");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/properties", propertiesRouter);
app.use("/api/openhouses", openHousesRouter);

app.get("/", (req, res) => {
  res.json({
    message: "IDX Exchange backend is running",
    health: "/api/health",
  });
});

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

const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || "127.0.0.1";

app.listen(PORT, HOST);
