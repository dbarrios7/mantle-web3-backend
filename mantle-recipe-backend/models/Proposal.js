import mongoose from "mongoose"

const proposalSchema = new mongoose.Schema({
  proposalId: {
    type: Number,
    required: true,
    unique: true,
  },
  tokenId: {
    type: Number,
    required: true,
  },
  week: {
    type: String,
    required: true, // formato: "2024-W01"
  },
  votes: {
    type: Number,
    default: 0,
  },
  active: {
    type: Boolean,
    default: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  txHash: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  finalizedAt: {
    type: Date,
  },
  isWinner: {
    type: Boolean,
    default: false,
  },
})

export default mongoose.model("Proposal", proposalSchema)
