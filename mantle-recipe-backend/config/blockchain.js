import { ethers } from "ethers"

// Configuración del proveedor para Mantle Network
export const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)

// Wallet del administrador para transacciones del servidor
export const adminWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

// ABIs de los contratos (simplificados para el ejemplo)
export const RECIPE_NFT_ABI = [
  "function mintRecipe(address to, string memory tokenURI) public returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
]

export const VOTING_ABI = [
  "function createProposal(uint256 tokenId, uint256 duration) public returns (uint256)",
  "function vote(uint256 proposalId) public",
  "function finalizeProposal(uint256 proposalId) public",
  "function getProposal(uint256 proposalId) public view returns (tuple(uint256 tokenId, uint256 votes, bool active, uint256 endTime))",
  "event ProposalCreated(uint256 indexed proposalId, uint256 indexed tokenId)",
  "event VoteCast(uint256 indexed proposalId, address indexed voter)",
  "event ProposalFinalized(uint256 indexed proposalId, uint256 indexed winnerTokenId)",
]

export const MNT_TOKEN_ABI = [
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function balanceOf(address account) public view returns (uint256)",
  "function decimals() public view returns (uint8)",
]

// Instancias de contratos
export const recipeNFTContract = new ethers.Contract(process.env.RECIPE_NFT_CONTRACT, RECIPE_NFT_ABI, adminWallet)

export const votingContract = new ethers.Contract(process.env.VOTING_CONTRACT, VOTING_ABI, adminWallet)

export const mntTokenContract = new ethers.Contract(process.env.MNT_TOKEN_CONTRACT, MNT_TOKEN_ABI, adminWallet)
