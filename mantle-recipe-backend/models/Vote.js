import mongoose from "mongoose"

const voteSchema = new mongoose.Schema({
  proposalId: {
    type: Number,
    required: true,
  },
  voter: {
    type: String,
    required: true,
    lowercase: true,
  },
  tokenId: {
    type: Number,
    required: true,
  },
  txHash: {
    type: String,
    required: true,
  },
  week: {
    type: String,
    required: true, // formato: "2024-W01"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Índice compuesto para evitar votos duplicados por propuesta
voteSchema.index({ proposalId: 1, voter: 1 }, { unique: true })

export default mongoose.model("Vote", voteSchema)
