import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  nonce: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["cook", "admin"],
    default: "cook",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
})

export default mongoose.model("User", userSchema)
