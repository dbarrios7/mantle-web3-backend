import { ethers } from "ethers"

// Validar dirección de Ethereum
export const isValidAddress = (address) => {
  try {
    return ethers.isAddress(address)
  } catch {
    return false
  }
}

// Formatear dirección (mostrar solo primeros y últimos caracteres)
export const formatAddress = (address, chars = 4) => {
  if (!address) return ""
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

// Convertir Wei a Ether
export const formatEther = (wei) => {
  return ethers.formatEther(wei)
}

// Convertir Ether a Wei
export const parseEther = (ether) => {
  return ethers.parseEther(ether.toString())
}

// Generar mensaje de firma estándar
export const generateSignMessage = (nonce) => {
  return `Firma este mensaje para autenticarte: ${nonce}`
}

// Obtener timestamp actual
export const getCurrentTimestamp = () => {
  return Math.floor(Date.now() / 1000)
}

// Validar hash de transacción
export const isValidTxHash = (hash) => {
  return /^0x[a-fA-F0-9]{64}$/.test(hash)
}
