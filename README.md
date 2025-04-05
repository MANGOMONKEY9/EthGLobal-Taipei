# Seven Carnival V2

A blockchain-based carnival game with DeFi features.

## Project Structure

```
.
├── blockchain/           # Smart contract development
│   ├── contracts/       # Solidity smart contracts
│   ├── test/           # Contract tests
│   ├── scripts/        # Deployment and utility scripts
│   └── package.json    # Blockchain dependencies
│
└── frontend/           # React frontend application
    ├── src/           # Source code
    ├── public/        # Static assets
    └── package.json   # Frontend dependencies
```

## Setup Instructions

### Blockchain Setup
1. Navigate to the blockchain directory:
   ```bash
   cd blockchain
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Compile contracts:
   ```bash
   npx hardhat compile
   ```
4. Run tests:
   ```bash
   npx hardhat test
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ``` 