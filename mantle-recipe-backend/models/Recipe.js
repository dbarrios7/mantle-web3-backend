import mongoose from "mongoose"

const recipeSchema = new mongoose.Schema({
  tokenId: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  ingredients: [
    {
      type: String,
      required: true,
    },
  ],
  steps: [
    {
      type: String,
      required: true,
    },
  ],
  author: {
    type: String,
    required: true,
    lowercase: true,
  },
  metadataURI: {
    type: String,
    required: true,
  },
  ipfsCID: {
    type: String,
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
  votes: {
    type: Number,
    default: 0,
  },
  isWeeklyWinner: {
    type: Boolean,
    default: false,
  },
})

export default mongoose.model("Recipe", recipeSchema)
