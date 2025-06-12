import express from "express"
import { body } from "express-validator"
import { VoteController } from "../controllers/voteController.js"
import { authenticateToken, requireCookRole, requireAdminRole } from "../middleware/auth.js"

const router = express.Router()

// POST /api/vote/proposal
// Crear nueva propuesta de votación (solo admin)
router.post(
  "/proposal",
  [
    authenticateToken,
    requireAdminRole,
    body("tokenId").isInt({ min: 1 }).withMessage("Token ID debe ser un número entero positivo"),
  ],
  VoteController.createProposal,
)

// POST /api/vote
// Votar por una propuesta (requiere autenticación)
router.post(
  "/",
  [
    authenticateToken,
    requireCookRole,
    body("proposalId").isInt({ min: 1 }).withMessage("Proposal ID debe ser un número entero positivo"),
    body("txHash").isLength({ min: 66, max: 66 }).withMessage("Hash de transacción inválido"),
  ],
  VoteController.vote,
)

// GET /api/vote/proposals
// Obtener propuestas activas
router.get("/proposals", VoteController.getActiveProposals)

// GET /api/vote/proposals/:proposalId
// Obtener detalles de una propuesta específica
router.get("/proposals/:proposalId", VoteController.getProposalDetails)

// GET /api/vote/weekly-winner
// Obtener ganador de la semana actual
router.get("/weekly-winner", VoteController.getWeeklyWinner)

export default router
