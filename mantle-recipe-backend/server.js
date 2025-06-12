import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import dotenv from "dotenv"
import rateLimit from "express-rate-limit"
import cron from "node-cron"

// Importar configuraciones y middlewares
import { connectDB } from "./config/database.js"
import { errorHandler } from "./middleware/errorHandler.js"

// Importar rutas
import authRoutes from "./routes/auth.js"
import recipeRoutes from "./routes/recipes.js"
import voteRoutes from "./routes/vote.js"

// Importar servicios para cron jobs
import { VotingService } from "./services/votingService.js"

// Cargar variables de entorno
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Conectar a la base de datos
connectDB()

// Rate limiting
const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // límite de requests por ventana
  message: "Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.",
  standardHeaders: true,
  legacyHeaders: false,
})

// Middlewares globales
app.use(helmet()) // Seguridad HTTP headers
app.use(cors()) // CORS
app.use(morgan("combined")) // Logging
app.use(limiter) // Rate limiting
app.use(express.json({ limit: "10mb" })) // Parse JSON bodies
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded bodies

// Rutas
app.use("/api/auth", authRoutes)
app.use("/api/recipes", recipeRoutes)
app.use("/api/vote", voteRoutes)

// Ruta de health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler)

// Cron job para finalizar votaciones semanales (cada domingo a las 23:59)
cron.schedule("59 23 * * 0", async () => {
  console.log("🗳️ Ejecutando finalización de votaciones semanales...")
  try {
    await VotingService.finalizeWeeklyVoting()
    console.log("✅ Votaciones semanales finalizadas exitosamente")
  } catch (error) {
    console.error("❌ Error al finalizar votaciones:", error)
  }
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`)
  console.log(`🌐 Entorno: ${process.env.NODE_ENV}`)
  console.log(`⛓️ Red: Mantle (Chain ID: ${process.env.CHAIN_ID})`)
})

export default app
