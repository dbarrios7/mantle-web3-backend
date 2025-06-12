import axios from "axios"
import FormData from "form-data"

export class IPFSService {
  // Subir JSON a IPFS usando Pinata
  static async uploadToPinata(jsonData) {
    try {
      const data = JSON.stringify(jsonData)

      const formData = new FormData()
      formData.append("file", Buffer.from(data), {
        filename: "metadata.json",
        contentType: "application/json",
      })

      const pinataMetadata = JSON.stringify({
        name: `Recipe-${jsonData.title}-${Date.now()}`,
        keyvalues: {
          type: "recipe-metadata",
          title: jsonData.title,
        },
      })
      formData.append("pinataMetadata", pinataMetadata)

      const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
          ...formData.getHeaders(),
        },
      })

      return {
        success: true,
        cid: response.data.IpfsHash,
        metadataURI: `ipfs://${response.data.IpfsHash}`,
      }
    } catch (error) {
      console.error("Error subiendo a Pinata:", error.response?.data || error.message)
      throw new Error("Error subiendo metadata a IPFS")
    }
  }

  // Alternativa: Subir a IPFS usando Infura
  static async uploadToInfura(jsonData) {
    try {
      const data = JSON.stringify(jsonData)

      const auth = Buffer.from(`${process.env.INFURA_PROJECT_ID}:${process.env.INFURA_PROJECT_SECRET}`).toString(
        "base64",
      )

      const response = await axios.post("https://ipfs.infura.io:5001/api/v0/add", data, {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      })

      return {
        success: true,
        cid: response.data.Hash,
        metadataURI: `ipfs://${response.data.Hash}`,
      }
    } catch (error) {
      console.error("Error subiendo a Infura:", error.response?.data || error.message)
      throw new Error("Error subiendo metadata a IPFS")
    }
  }

  // Método principal que intenta Pinata primero, luego Infura
  static async uploadMetadata(recipeData) {
    const metadata = {
      name: recipeData.title,
      description: `Receta: ${recipeData.title}`,
      image: "ipfs://QmYourDefaultRecipeImageCID", // Reemplazar con imagen por defecto
      attributes: [
        {
          trait_type: "Ingredients Count",
          value: recipeData.ingredients.length,
        },
        {
          trait_type: "Steps Count",
          value: recipeData.steps.length,
        },
        {
          trait_type: "Author",
          value: recipeData.author,
        },
        {
          trait_type: "Created",
          value: new Date().toISOString(),
        },
      ],
      recipe: {
        title: recipeData.title,
        ingredients: recipeData.ingredients,
        steps: recipeData.steps,
        author: recipeData.author,
      },
    }

    // Intentar Pinata primero
    if (process.env.PINATA_JWT) {
      try {
        return await this.uploadToPinata(metadata)
      } catch (error) {
        console.log("Pinata falló, intentando Infura...")
      }
    }

    // Fallback a Infura
    if (process.env.INFURA_PROJECT_ID) {
      return await this.uploadToInfura(metadata)
    }

    throw new Error("No hay servicios IPFS configurados")
  }
}
