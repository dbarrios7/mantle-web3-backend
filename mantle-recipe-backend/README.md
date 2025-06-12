# Backend de Recetas NFT en Mantle Network

Backend completo en Node.js con Express y ethers.js para un sistema de recetas NFT en la red Mantle que incluye autenticación con wallet, minting de NFTs y sistema de votación con recompensas.

## 🚀 Características

- **Autenticación con Wallet**: Sistema de nonce y verificación de firma con JWT
- **Minting de NFTs**: Creación de recetas como NFTs con metadata en IPFS
- **Sistema de Votación**: Votación semanal con recompensas en tokens MNT
- **Base de Datos**: MongoDB para almacenamiento de datos
- **Seguridad**: Rate limiting, validación de datos, manejo de errores
- **Automatización**: Cron jobs para finalización de votaciones

## 📋 Requisitos Previos

- Node.js v18+
- MongoDB
- Cuenta en Pinata o Infura para IPFS
- Wallet con MNT para transacciones de admin

## 🛠️ Instalación

1. Clonar el repositorio:
\`\`\`bash
git clone <repo-url>
cd mantle-recipe-backend
\`\`\`

2. Instalar dependencias:
\`\`\`bash
npm install
\`\`\`

3. Configurar variables de entorno:
\`\`\`bash
cp .env.example .env
# Editar .env con tus valores
\`\`\`

4. Iniciar el servidor:
\`\`\`bash
# Desarrollo
npm run dev

# Producción
npm start
\`\`\`

## 🔧 Configuración

### Variables de Entorno

Copia `.env.example` a `.env` y configura:

- `MONGODB_URI`: URL de conexión a MongoDB
- `JWT_SECRET`: Clave secreta para JWT
- `RPC_URL`: URL RPC de Mantle Network
- `PRIVATE_KEY`: Clave privada del wallet admin
- `PINATA_JWT`: Token JWT de Pinata para IPFS
- Direcciones de contratos desplegados

### Contratos Requeridos

Necesitas desplegar estos contratos en Mantle:

1. **RecipeNFT** (ERC-721): Para mintear recetas como NFTs
2. **VotingContract**: Para gestionar propuestas y votaciones
3. **MNT Token**: Token para recompensas (puede usar el nativo)

## 📡 API Endpoints

### Autenticación

\`\`\`bash
# Generar nonce
GET /api/auth/nonce?address=0x...

# Verificar firma y obtener JWT
POST /api/auth/verify
{
  "address": "0x...",
  "signature": "0x..."
}
\`\`\`

### Recetas

\`\`\`bash
# Crear receta NFT
POST /api/recipes
Authorization: Bearer <jwt>
{
  "title": "Pizza Margherita",
  "ingredients": ["Masa", "Tomate", "Mozzarella"],
  "steps": ["Preparar masa", "Añadir ingredientes", "Hornear"]
}

# Obtener todas las recetas
GET /api/recipes?page=1&limit=10

# Obtener receta por token ID
GET /api/recipes/123

# Obtener recetas de usuario
GET /api/recipes/user/0x...
\`\`\`

### Votación

\`\`\`bash
# Crear propuesta (solo admin)
POST /api/vote/proposal
Authorization: Bearer <jwt>
{
  "tokenId": 123
}

# Registrar voto
POST /api/vote
Authorization: Bearer <jwt>
{
  "proposalId": 1,
  "txHash": "0x..."
}

# Obtener propuestas activas
GET /api/vote/proposals

# Obtener ganador semanal
GET /api/vote/weekly-winner
\`\`\`

## 🏗️ Estructura del Proyecto

\`\`\`
├── config/
│   ├── database.js          # Configuración MongoDB
│   └── blockchain.js        # Configuración ethers.js
├── controllers/
│   ├── authController.js    # Controlador de autenticación
│   ├── recipeController.js  # Controlador de recetas
│   └── voteController.js    # Controlador de votación
├── middleware/
│   ├── auth.js             # Middleware de autenticación
│   └── errorHandler.js     # Manejo global de errores
├── models/
│   ├── User.js             # Modelo de usuario
│   ├── Recipe.js           # Modelo de receta
│   ├── Vote.js             # Modelo de voto
│   └── Proposal.js         # Modelo de propuesta
├── routes/
│   ├── auth.js             # Rutas de autenticación
│   ├── recipes.js          # Rutas de recetas
│   └── vote.js             # Rutas de votación
├── services/
│   ├── authService.js      # Lógica de autenticación
│   ├── ipfsService.js      # Integración con IPFS
│   ├── recipeService.js    # Lógica de recetas
│   └── votingService.js    # Lógica de votación
├── utils/
│   └── helpers.js          # Funciones auxiliares
└── server.js               # Punto de entrada
\`\`\`

## 🔄 Flujo de Trabajo

### 1. Autenticación
1. Frontend solicita nonce: `GET /api/auth/nonce?address=0x...`
2. Usuario firma mensaje con nonce en MetaMask
3. Frontend envía firma: `POST /api/auth/verify`
4. Backend verifica y devuelve JWT

### 2. Crear Receta NFT
1. Usuario autenticado envía datos de receta
2. Backend sube metadata a IPFS
3. Backend mintea NFT en contrato
4. Se guarda registro en MongoDB

### 3. Sistema de Votación
1. Admin crea propuesta semanal
2. Usuarios votan desde frontend (transacción on-chain)
3. Backend registra votos en BD
4. Cron job finaliza votación y distribuye recompensas

## 🛡️ Seguridad

- Rate limiting para prevenir spam
- Validación de datos con express-validator
- Autenticación JWT con roles
- Verificación de firmas criptográficas
- Manejo seguro de claves privadas

## 🚨 Consideraciones de Producción

1. **Claves Privadas**: Usar servicios como AWS KMS o HashiCorp Vault
2. **Base de Datos**: Configurar réplicas y backups
3. **Monitoreo**: Implementar logging y métricas
4. **Escalabilidad**: Considerar load balancers y clustering
5. **Gas Fees**: Implementar estimación y optimización de gas

## 📝 Licencia

MIT License
