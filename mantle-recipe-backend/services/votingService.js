import { votingContract, mntTokenContract } from "../config/blockchain.js"
import { ethers } from "ethers"
import Proposal from "../models/Proposal.js"
import Vote from "../models/Vote.js"
import Recipe from "../models/Recipe.js"

export class VotingService {
  // Obtener número de semana ISO
  static getWeekNumber(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return `${d.getUTCFullYear()}-W${Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
      .toString()
      .padStart(2, "0")}`
  }

  // Crear nueva propuesta de votación
  static async createProposal(tokenId) {
    try {
      // Verificar que la receta existe
      const recipe = await Recipe.findOne({ tokenId })
      if (!recipe) {
        throw new Error("Receta no encontrada")
      }

      // Duración de votación: 7 días (en segundos)
      const duration = 7 * 24 * 60 * 60

      console.log("🗳️ Creando propuesta en blockchain...")
      const tx = await votingContract.createProposal(tokenId, duration)
      const receipt = await tx.wait()

      // Extraer proposalId del evento
      const proposalEvent = receipt.logs.find(
        (log) => log.topics[0] === votingContract.interface.getEvent("ProposalCreated").topicHash,
      )

      if (!proposalEvent) {
        throw new Error("No se pudo obtener el proposalId del evento")
      }

      const proposalId = Number.parseInt(proposalEvent.topics[1], 16)
      const week = this.getWeekNumber()
      const endTime = new Date(Date.now() + duration * 1000)

      console.log("✅ Propuesta creada. ID:", proposalId)

      // Guardar en base de datos
      const proposal = new Proposal({
        proposalId,
        tokenId,
        week,
        endTime,
        txHash: receipt.hash,
      })

      await proposal.save()

      return {
        success: true,
        proposalId,
        tokenId,
        week,
        endTime,
        txHash: receipt.hash,
      }
    } catch (error) {
      console.error("❌ Error creando propuesta:", error)
      throw error
    }
  }

  // Registrar voto (el usuario ya envió la tx desde el frontend)
  static async registerVote({ proposalId, voter, txHash }) {
    try {
      // Verificar que la propuesta existe y está activa
      const proposal = await Proposal.findOne({ proposalId, active: true })
      if (!proposal) {
        throw new Error("Propuesta no encontrada o inactiva")
      }

      // Verificar que no ha votado antes
      const existingVote = await Vote.findOne({ proposalId, voter: voter.toLowerCase() })
      if (existingVote) {
        throw new Error("Ya has votado en esta propuesta")
      }

      // Registrar voto en base de datos
      const vote = new Vote({
        proposalId,
        voter: voter.toLowerCase(),
        tokenId: proposal.tokenId,
        txHash,
        week: proposal.week,
      })

      await vote.save()

      // Actualizar contador de votos en la propuesta
      await Proposal.findOneAndUpdate({ proposalId }, { $inc: { votes: 1 } })

      console.log("✅ Voto registrado para propuesta:", proposalId)

      return {
        success: true,
        message: "Voto registrado exitosamente",
        proposalId,
        voter: voter.toLowerCase(),
      }
    } catch (error) {
      console.error("❌ Error registrando voto:", error)
      throw error
    }
  }

  // Obtener propuestas activas
  static async getActiveProposals() {
    const now = new Date()

    const proposals = await Proposal.find({
      active: true,
      endTime: { $gt: now },
    })
      .populate("tokenId", "title author")
      .sort({ createdAt: -1 })
      .lean()

    // Enriquecer con datos de recetas
    const enrichedProposals = await Promise.all(
      proposals.map(async (proposal) => {
        const recipe = await Recipe.findOne({ tokenId: proposal.tokenId })
        return {
          ...proposal,
          recipe: recipe
            ? {
                title: recipe.title,
                author: recipe.author,
                ingredients: recipe.ingredients,
                steps: recipe.steps,
              }
            : null,
        }
      }),
    )

    return enrichedProposals
  }

  // Obtener detalles de una propuesta
  static async getProposalDetails(proposalId) {
    const proposal = await Proposal.findOne({ proposalId }).lean()

    if (!proposal) {
      return null
    }

    // Obtener receta asociada
    const recipe = await Recipe.findOne({ tokenId: proposal.tokenId }).lean()

    // Obtener votos
    const votes = await Vote.find({ proposalId }).lean()

    return {
      ...proposal,
      recipe,
      votes,
      voterAddresses: votes.map((v) => v.voter),
    }
  }

  // Obtener ganador de la semana actual
  static async getCurrentWeekWinner() {
    const currentWeek = this.getWeekNumber()

    const winner = await Proposal.findOne({
      week: currentWeek,
      isWinner: true,
    }).lean()

    if (!winner) {
      return { message: "No hay ganador para esta semana aún" }
    }

    const recipe = await Recipe.findOne({ tokenId: winner.tokenId }).lean()

    return {
      proposal: winner,
      recipe,
      week: currentWeek,
    }
  }

  // Finalizar votaciones semanales (ejecutado por cron job)
  static async finalizeWeeklyVoting() {
    try {
      const now = new Date()
      const currentWeek = this.getWeekNumber()

      // Buscar propuestas que deben ser finalizadas
      const proposalsToFinalize = await Proposal.find({
        active: true,
        endTime: { $lte: now },
      })

      console.log(`🔄 Finalizando ${proposalsToFinalize.length} propuestas...`)

      for (const proposal of proposalsToFinalize) {
        try {
          // Finalizar propuesta en blockchain
          const tx = await votingContract.finalizeProposal(proposal.proposalId)
          await tx.wait()

          // Marcar como finalizada en BD
          await Proposal.findOneAndUpdate(
            { proposalId: proposal.proposalId },
            {
              active: false,
              finalizedAt: now,
            },
          )

          console.log(`✅ Propuesta ${proposal.proposalId} finalizada`)
        } catch (error) {
          console.error(`❌ Error finalizando propuesta ${proposal.proposalId}:`, error)
        }
      }

      // Determinar ganador de la semana
      await this.determineWeeklyWinner(currentWeek)

      // Distribuir recompensas
      await this.distributeWeeklyRewards(currentWeek)
    } catch (error) {
      console.error("❌ Error en finalización semanal:", error)
      throw error
    }
  }

  // Determinar ganador semanal
  static async determineWeeklyWinner(week) {
    try {
      // Buscar propuesta con más votos de la semana
      const winner = await Proposal.findOne({
        week,
        active: false,
      }).sort({ votes: -1 })

      if (winner && winner.votes > 0) {
        // Marcar como ganadora
        await Proposal.findOneAndUpdate({ proposalId: winner.proposalId }, { isWinner: true })

        // Marcar receta como ganadora semanal
        await Recipe.findOneAndUpdate({ tokenId: winner.tokenId }, { isWeeklyWinner: true })

        console.log(`🏆 Ganador semanal: Propuesta ${winner.proposalId} con ${winner.votes} votos`)
      }
    } catch (error) {
      console.error("❌ Error determinando ganador semanal:", error)
    }
  }

  // Distribuir recompensas semanales
  static async distributeWeeklyRewards(week) {
    try {
      const winner = await Proposal.findOne({
        week,
        isWinner: true,
      })

      if (!winner) {
        console.log("ℹ️ No hay ganador para distribuir recompensas")
        return
      }

      // Obtener todos los votantes de la propuesta ganadora
      const votes = await Vote.find({ proposalId: winner.proposalId })

      if (votes.length === 0) {
        console.log("ℹ️ No hay votantes para recompensar")
        return
      }

      // Recompensas (ajustar según tokenomics)
      const rewardPerVoter = ethers.parseEther("10") // 10 MNT por votante
      const authorReward = ethers.parseEther("50") // 50 MNT para el autor

      console.log(`💰 Distribuyendo recompensas a ${votes.length} votantes...`)

      // Recompensar votantes
      for (const vote of votes) {
        try {
          const tx = await mntTokenContract.transfer(vote.voter, rewardPerVoter)
          await tx.wait()
          console.log(`✅ Recompensa enviada a votante: ${vote.voter}`)
        } catch (error) {
          console.error(`❌ Error enviando recompensa a ${vote.voter}:`, error)
        }
      }

      // Recompensar autor de la receta ganadora
      const recipe = await Recipe.findOne({ tokenId: winner.tokenId })
      if (recipe) {
        try {
          const tx = await mntTokenContract.transfer(recipe.author, authorReward)
          await tx.wait()
          console.log(`✅ Recompensa de autor enviada a: ${recipe.author}`)
        } catch (error) {
          console.error(`❌ Error enviando recompensa de autor:`, error)
        }
      }
    } catch (error) {
      console.error("❌ Error distribuyendo recompensas:", error)
    }
  }
}
