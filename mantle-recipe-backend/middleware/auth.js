import jwt from "jsonwebtoken"
import User from "../models/User.js"

// Middleware para verificar JWT
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: "Token de acceso requerido",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Verificar que el usuario existe
    const user = await User.findOne({ address: decoded.address })
    if (!user) {
      return res.status(401).json({
        error: "Usuario no encontrado",
      })
    }

    req.user = {
      address: decoded.address,
      role: decoded.role,
    }

    next()
  } catch (error) {
    console.error("Error en autenticación:", error)
    return res.status(403).json({
      error: "Token inválido",
    })
  }
}

// Middleware para verificar rol de cocinero
export const requireCookRole = (req, res, next) => {
  if (req.user.role !== "cook" && req.user.role !== "admin") {
    return res.status(403).json({
      error: "Acceso denegado. Se requiere rol de cocinero.",
    })
  }
  next()
}

// Middleware para verificar rol de administrador
export const requireAdminRole = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Acceso denegado. Se requiere rol de administrador.",
    })
  }
  next()
}
