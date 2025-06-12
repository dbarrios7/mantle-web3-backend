import jwt from "jsonwebtoken"
import { ethers } from "ethers"
import crypto from "crypto"
import User from "../models/User.js"

export class AuthService {
  // Generar nonce único para una dirección
  static async generateNonce(address) {
    const normalizedAddress = address.toLowerCase()

    // Generar nonce aleatorio
    const nonce = crypto.randomBytes(32).toString("hex")

    // Buscar o crear usuario
    let user = await User.findOne({ address: normalizedAddress })

    if (!user) {
      user = new User({
        address: normalizedAddress,
        nonce,
        role: "cook",
      })
    } else {
      user.nonce = nonce
    }

    await user.save()

    return nonce
  }

  // Verificar firma y generar JWT
  static async verifySignature(address, signature) {
    const normalizedAddress = address.toLowerCase()

    // Buscar usuario y nonce
    const user = await User.findOne({ address: normalizedAddress })

    if (!user) {
      throw new Error("Usuario no encontrado. Genera un nonce primero.")
    }

    // Crear mensaje que debería haber sido firmado
    const message = `Firma este mensaje para autenticarte: ${user.nonce}`

    try {
      // Verificar la firma
      const recoveredAddress = ethers.verifyMessage(message, signature)

      if (recoveredAddress.toLowerCase() !== normalizedAddress) {
        throw new Error("Firma inválida")
      }

      // Actualizar último login
      user.lastLogin = new Date()
      await user.save()

      // Generar JWT
      const token = jwt.sign(
        {
          address: normalizedAddress,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        },
      )

      return {
        success: true,
        token,
        user: {
          address: normalizedAddress,
          role: user.role,
          lastLogin: user.lastLogin,
        },
      }
    } catch (error) {
      throw new Error("Error verificando firma: " + error.message)
    }
  }
}
