require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");

const { connectDB } = require("./config/database");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Route imports
const authRoutes = require("./routes/authRoutes");
const programRoutes = require("./routes/programRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const articleRoutes = require("./routes/articleRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const settingsRoutes = require("./routes/settingsRoutes"); // ✅ TAMBAHAN

const app = express();
const PORT = process.env.PORT || 5000;

// ================================================
// SECURITY MIDDLEWARE
// ================================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Izinkan gambar diakses frontend
  })
);

// ================================================
// CORS
// ================================================
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin '${origin}' tidak diizinkan.`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ================================================
// RATE LIMITER
// ================================================
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 menit
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak request. Coba lagi setelah 15 menit.",
  },
});

// Rate limit ketat untuk auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Terlalu banyak percobaan login. Coba lagi setelah 15 menit.",
  },
});

app.use("/api/", limiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ================================================
// GENERAL MIDDLEWARE
// ================================================
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ================================================
// STATIC FILES (uploads)
// ================================================
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "7d",
    etag: true,
  })
);

// ================================================
// HEALTH CHECK
// ================================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🎉 AORA Wistara API is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    docs: "Lihat README.md untuk dokumentasi API",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server sehat!",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
});

// ================================================
// ROUTES
// ================================================
app.use("/api/auth", authRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/galleries", galleryRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/settings", settingsRoutes); // ✅ TAMBAHAN

// ================================================
// ERROR HANDLING
// ================================================
app.use(notFound);
app.use(errorHandler);

// ================================================
// START SERVER
// ================================================
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log("\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  🚀 AORA Wistara Backend API");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`  🌐 URL      : http://localhost:${PORT}`);
    console.log(`  📦 ENV      : ${process.env.NODE_ENV}`);
    console.log(`  🗄️  Database : ${process.env.DB_NAME}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  });
};

startServer();

module.exports = app;
