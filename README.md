# Backend Web3 para Recetas NFT en Mantle Network

Backend completo en Node.js con Express y ethers.js para una plataforma de recetas NFT en Mantle Network con sistema de votación y recompensas.

## 🚀 Características

- **Autenticación Web3**: Sistema de autenticación con wallet usando nonce y JWT
- **NFT Minting**: Creación de recetas como NFTs con metadata en IPFS
- **Sistema de Votación**: Votación semanal de "Receta de la Semana" con recompensas en MNT
- **Distribución Automática**: Cron jobs para finalizar votaciones y distribuir recompensas
- **Base de Datos**: MongoDB para almacenamiento de datos off-chain
- **Seguridad**: Rate limiting, validación de datos, manejo de errores

## 🛠️ Tecnologías

- **Backend**: Node.js, Express.js
- **Blockchain**: ethers.js, Mantle Network
- **Base de Datos**: MongoDB, Mongoose
- **IPFS**: Pinata para almacenamiento descentralizado
- **Autenticación**: JWT, firma de mensajes Web3
- **Automatización**: node-cron para tareas programadas

## 📦 Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd mantle-web3-backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Configurar MongoDB**
```bash
# Instalar MongoDB localmente o usar MongoDB Atlas
# Actualizar MONGODB_URI en .env
```

5. **Desplegar contratos (opcional)**
```bash
node scripts/deploy-contracts.js
```

6. **Iniciar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos
MONGODB_URI=mongodb://localhost:27017/mantle-recipes

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_EXPIRES_IN=7d

# Mantle Network
RPC_URL=https://rpc.mantle.xyz
CHAIN_ID=5000
PRIVATE_KEY=tu_private_key_admin

# Contratos
RECIPE_NFT_CONTRACT=0x...
VOTING_CONTRACT=0x...
MNT_TOKEN_CONTRACT=0x...

# IPFS (Pinata)
PINATA_API_KEY=tu_api_key
PINATA_SECRET_API_KEY=tu_secret_key
PINATA_JWT=tu_jwt_token
```

### Configuración de Contratos

Los contratos inteligentes deben desplegarse en Mantle Network:

1. **RecipeNFT**: Contrato ERC-721 para NFTs de recetas
2. **VotingContract**: Contrato para votación y distribución de recompensas
3. **MNT Token**: Token nativo de Mantle para recompensas

## 📚 API Endpoints

### Autenticación

```http
GET /api/auth/nonce/:address
POST /api/auth/verify