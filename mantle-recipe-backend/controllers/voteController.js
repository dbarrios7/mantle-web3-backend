import { validationResult } from "express-validator"
import { VotingService } from "../services/votingService.js"

export class VoteController {
  // Crear nueva propuesta de votación
  static async createProposal(req, res, next) {
    try {
      // Validar entrada
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Datos inválidos",
          details: errors.array(),
        })
      }

      const { tokenId } = req.body

      const result = await VotingService.createProposal(tokenId)

      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  // Registrar voto
  static async vote(req, res, next) {
    try {
      // Validar entrada
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Datos inválidos",
          details: errors.array(),
        })
      }

      const { proposalId, txHash } = req.body
      const voterAddress = req.user.address

      const result = await VotingService.registerVote({
        proposalId: Number.parseInt(proposalId),
        voter: voterAddress,
        txHash,
      })

      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  // Obtener propuestas activas
  static async getActiveProposals(req, res, next) {
    try {
      const proposals = await VotingService.getActiveProposals()
      res.json(proposals)
    } catch (error) {
      next(error)
    }
  }

  // Obtener detalles de propuesta
  static async getProposalDetails(req, res, next) {
    try {
      const { proposalId } = req.params

      const proposal = await VotingService.getProposalDetails(Number.parseInt(proposalId))

      if (!proposal) {
        return res.status(404).json({
          error: "Propuesta no encontrada",
        })
      }

      res.json(proposal)
    } catch (error) {
      next(error)
    }
  }

  // Obtener ganador semanal
  static async getWeeklyWinner(req, res, next) {
    try {
      const winner = await VotingService.getCurrentWeekWinner()
      res.json(winner)
    } catch (error) {
      next(error)
    }
  }
}
