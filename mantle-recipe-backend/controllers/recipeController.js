import { validationResult } from "express-validator"
import { RecipeService } from "../services/recipeService.js"

export class RecipeController {
  // Crear nueva receta NFT
  static async createRecipe(req, res, next) {
    try {
      // Validar entrada
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Datos inválidos",
          details: errors.array(),
        })
      }

      const { title, ingredients, steps } = req.body
      const userAddress = req.user.address

      const result = await RecipeService.createRecipe({
        title,
        ingredients,
        steps,
        author: userAddress,
      })

      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  // Obtener todas las recetas
  static async getAllRecipes(req, res, next) {
    try {
      const { page = 1, limit = 10, sortBy = "createdAt" } = req.query

      const recipes = await RecipeService.getAllRecipes({
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        sortBy,
      })

      res.json(recipes)
    } catch (error) {
      next(error)
    }
  }

  // Obtener receta por token ID
  static async getRecipeByTokenId(req, res, next) {
    try {
      const { tokenId } = req.params

      const recipe = await RecipeService.getRecipeByTokenId(Number.parseInt(tokenId))

      if (!recipe) {
        return res.status(404).json({
          error: "Receta no encontrada",
        })
      }

      res.json(recipe)
    } catch (error) {
      next(error)
    }
  }

  // Obtener recetas de un usuario
  static async getRecipesByUser(req, res, next) {
    try {
      const { address } = req.params
      const { page = 1, limit = 10 } = req.query

      const recipes = await RecipeService.getRecipesByUser(address, {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
      })

      res.json(recipes)
    } catch (error) {
      next(error)
    }
  }
}
