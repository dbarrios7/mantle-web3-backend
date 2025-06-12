import { recipeNFTContract } from "../config/blockchain.js"
import { IPFSService } from "./ipfsService.js"
import Recipe from "../models/Recipe.js"

export class RecipeService {
  // Crear nueva receta NFT
  static async createRecipe(recipeData) {
    try {
      // 1. Subir metadata a IPFS
      console.log("📤 Subiendo metadata a IPFS...")
      const ipfsResult = await IPFSService.uploadMetadata(recipeData)

      if (!ipfsResult.success) {
        throw new Error("Error subiendo metadata a IPFS")
      }

      console.log("✅ Metadata subida a IPFS:", ipfsResult.cid)

      // 2. Mintear NFT en el contrato
      console.log("🔨 Minteando NFT en Mantle...")
      const tx = await recipeNFTContract.mintRecipe(recipeData.author, ipfsResult.metadataURI)

      console.log("⏳ Esperando confirmación de transacción...")
      const receipt = await tx.wait()

      // 3. Extraer tokenId del evento Transfer
      const transferEvent = receipt.logs.find(
        (log) => log.topics[0] === recipeNFTContract.interface.getEvent("Transfer").topicHash,
      )

      if (!transferEvent) {
        throw new Error("No se pudo obtener el tokenId del evento")
      }

      const tokenId = Number.parseInt(transferEvent.topics[3], 16)

      console.log("✅ NFT minteado exitosamente. Token ID:", tokenId)

      // 4. Guardar en base de datos
      const recipe = new Recipe({
        tokenId,
        title: recipeData.title,
        ingredients: recipeData.ingredients,
        steps: recipeData.steps,
        author: recipeData.author,
        metadataURI: ipfsResult.metadataURI,
        ipfsCID: ipfsResult.cid,
        txHash: receipt.hash,
      })

      await recipe.save()

      return {
        success: true,
        tokenId,
        txHash: receipt.hash,
        metadataURI: ipfsResult.metadataURI,
        ipfsCID: ipfsResult.cid,
        recipe: recipe.toObject(),
      }
    } catch (error) {
      console.error("❌ Error creando receta:", error)
      throw error
    }
  }

  // Obtener todas las recetas con paginación
  static async getAllRecipes({ page = 1, limit = 10, sortBy = "createdAt" }) {
    const skip = (page - 1) * limit

    const recipes = await Recipe.find()
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Recipe.countDocuments()

    return {
      recipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  // Obtener receta por token ID
  static async getRecipeByTokenId(tokenId) {
    return await Recipe.findOne({ tokenId }).lean()
  }

  // Obtener recetas de un usuario
  static async getRecipesByUser(address, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit

    const recipes = await Recipe.find({ author: address.toLowerCase() })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Recipe.countDocuments({ author: address.toLowerCase() })

    return {
      recipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }
}
