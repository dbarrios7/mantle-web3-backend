import express from "express"
import { body } from "express-validator"
import { AuthController } from "../controllers/authController.js"

const router = express.Router()

// GET /api/auth/nonce?address=<address>
// Genera y guarda un nonce único para la dirección
router.get("/nonce", AuthController.generateNonce)

// POST /api/auth/verify
// Verifica la firma y devuelve JWT
router.post(
  "/verify",
  [
    body("address").isEthereumAddress().withMessage("Dirección de Ethereum inválida"),
    body("signature").isLength({ min: 132, max: 132 }).withMessage("Firma inválida"),
  ],
  AuthController.verifySignature,
)

export default router
