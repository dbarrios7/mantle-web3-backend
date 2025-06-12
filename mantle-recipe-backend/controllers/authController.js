import { validationResult } from "express-validator"
import { AuthService } from "../services/authService.js"

export class AuthController {
  // Generar nonce para autenticación
  static async generateNonce(req, res, next) {
    try {
      const { address } = req.query

      if (!address) {
        return res.status(400).json({
          error: "Dirección requerida",
        })
      }

      const nonce = await AuthService.generateNonce(address)

      res.json({
        nonce,
        message: `Firma este mensaje para autenticarte: ${nonce}`,
      })
    } catch (error) {
      next(error)
    }
  }

  // Verificar firma y generar JWT
  static async verifySignature(req, res, next) {
    try {
      // Validar entrada
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Datos inválidos",
          details: errors.array(),
        })
      }

      const { address, signature } = req.body

      const result = await AuthService.verifySignature(address, signature)

      res.json(result)
    } catch (error) {
      next(error)
    }
  }
}
