import express from "express"
import { body } from "express-validator"
import { RecipeController } from "../controllers/recipeController.js"
import { authenticateToken, requireCookRole } from "../middleware/auth.js"

const router = express.Router()

// POST /api/recipes
// Crear nueva receta NFT (requiere autenticación)
router.post(
  "/",
  [
    authenticateToken,
    requireCookRole,
    body("title").isLength({ min: 3, max: 100 }).withMessage("El título debe tener entre 3 y 100 caracteres"),
    body("ingredients").isArray({ min: 1 }).withMessage("Debe incluir al menos un ingrediente"),
    body("steps").isArray({ min: 1 }).withMessage("Debe incluir al menos un paso"),
  ],
  RecipeController.createRecipe,
)

// GET /api/recipes
// Obtener todas las recetas
router.get("/", RecipeController.getAllRecipes)

// GET /api/recipes/:tokenId
// Obtener receta por token ID
router.get("/:tokenId", RecipeController.getRecipeByTokenId)

// GET /api/recipes/user/:address
// Obtener recetas de un usuario específico
router.get("/user/:address", RecipeController.getRecipesByUser)

export default router
