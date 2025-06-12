// Middleware global para manejo de errores
export const errorHandler = (err, req, res, next) => {
  console.error("Error stack:", err.stack)

  // Error de validación de Mongoose
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({
      error: "Error de validación",
      details: errors,
    })
  }

  // Error de duplicado en MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(400).json({
      error: `${field} ya existe`,
    })
  }

  // Error de JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Token inválido",
    })
  }

  // Error de JWT expirado
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Token expirado",
    })
  }

  // Error de ethers.js
  if (err.code && err.code.startsWith("CALL_EXCEPTION")) {
    return res.status(400).json({
      error: "Error en llamada al contrato",
      details: err.reason || err.message,
    })
  }

  // Error genérico del servidor
  res.status(500).json({
    error: "Error interno del servidor",
    message: process.env.NODE_ENV === "development" ? err.message : "Algo salió mal",
  })
}
