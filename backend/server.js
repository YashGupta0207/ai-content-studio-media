import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import contentRoutes from "./routes/content.js";
import imageRoutes from "./routes/images.js";
import uploadRoutes from "./routes/upload.js";
import exportRoutes from "./routes/export.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Ensure uploads directory exists at startup
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("📁 Created uploads/ directory");
}

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Serve frontend in production
app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api", contentRoutes);
app.use("/api", imageRoutes);
app.use("/api", uploadRoutes);
app.use("/api", exportRoutes);

// Health check
app.get("/health", (_, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// Global error handler
app.use((err, req, res, next) => {
    console.error("[global error]", err);
    res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Social Studio running on http://localhost:${PORT}`));