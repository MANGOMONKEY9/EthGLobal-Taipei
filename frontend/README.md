# SEVEN Blockchain Carnival

A simple educational game to learn about blockchain concepts through interactive booths. This application integrates with Rabby Wallet and uses 7ONE tokens.

## Features

- Connect to Rabby Wallet via RabbyKit
- Character movement with arrow keys to navigate between booths
- Six interactive booths teaching different blockchain concepts:
  1. Decentralisation & Trustlessness (Fireside Chat)
  2. Valentine's Day Special (Bubble Tea)
  3. Self Custody Workshop (Seed Phrase Generation)
  4. DeFi Workshop (Liquidity Pools and Token Swaps)
  5. The Future of Web3 (Fireside Chat)
  6. Build on Unichain (Create Your Own Token)
- Inventory system to collect items from booths
- 7ONE token integration for in-game purchases

## Getting Started

### Prerequisites

- Node.js 16+ installed
- Rabby Wallet Chrome extension installed
- 7ONE tokens in your wallet

### Installation

1. Clone this repository:
```sh
git clone https://github.com/yourusername/seven-blockchain-carnival.git
cd seven-blockchain-carnival
```

2. Install dependencies:
```sh
npm install
```

3. Start the development server:
```sh
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## How to Play

1. Connect your Rabby Wallet to the game
2. Use arrow keys (↑ ↓ ← →) to move your character around
3. Approach a booth and press SPACE to interact with it
4. Complete activities at each booth to learn about blockchain concepts
5. Collect items in your inventory
6. Some actions require spending 7ONE tokens

## Technical Details

This project uses:
- React with TypeScript
- Vite for build tooling
- RabbyKit for wallet connection
- Wagmi/Core for blockchain interaction
- Styled Components for styling

## 7ONE Token

The application connects to the 7ONE token contract deployed at:
`0x38975a20aabbfc4D0e9b404bFD69094C69DA237c`

## Future Enhancements

- NFT verification for access
- Multiplayer functionality
- Additional booths and educational content
- More interactive activities per booth
- Enhanced visual design with proper game assets

## License

MIT