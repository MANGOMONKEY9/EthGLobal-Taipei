import { useState } from 'react';
import { ethers } from 'ethers';

// Contract addresses
const SEVEN_TOKEN_ADDRESS = '0x38975a20aabbfc4D0e9b404bFD69094C69DA237c';
const USDC_ADDRESS = '0x1234567890123456789012345678901234567890'; // Replace with actual USDC address
const ETH_ADDRESS = '0x0000000000000000000000000000000000000000';
const SIMPLE_SWAP_ADDRESS = '0x9876543210987654321098765432109876543210'; // Replace with deployed contract address

// ABIs
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)"
];

const SIMPLE_SWAP_ABI = [
  "function swapTokens(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin) external",
  "function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) public view returns (uint256)",
  "function getContractBalance(address token) external view returns (uint256)",
  "function createPool(address token, string memory symbol) external",
  "function getCustomPools() external view returns (address[], string[], uint8[], uint256[])"
];

interface Pool {
  token0: string;
  token1: string;
  token0Symbol: string;
  token1Symbol: string;
  liquidity: string;
}

interface CustomPool {
  token: string;
  symbol: string;
  decimals: number;
  balance: string;
}

export function useDeFi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pools, setPools] = useState<Pool[]>([]);
  const [customPools, setCustomPools] = useState<CustomPool[]>([]);

  // Get all pools including custom pools
  const fetchPools = async () => {
    if (!window.ethereum) return;
    setIsLoading(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const simpleSwap = new ethers.Contract(SIMPLE_SWAP_ADDRESS, SIMPLE_SWAP_ABI, provider);
      
      // Create pool objects for our supported pairs
      const standardPools: Pool[] = [];

      // Get USDC/7ONE pool
      const usdcSevenLiquidity = await simpleSwap.getContractBalance(USDC_ADDRESS);
      standardPools.push({
        token0: USDC_ADDRESS,
        token1: SEVEN_TOKEN_ADDRESS,
        token0Symbol: 'USDC',
        token1Symbol: '7ONE',
        liquidity: ethers.formatUnits(usdcSevenLiquidity, 6)
      });

      // Get USDC/ETH pool
      const usdcEthLiquidity = await simpleSwap.getContractBalance(USDC_ADDRESS);
      standardPools.push({
        token0: USDC_ADDRESS,
        token1: ETH_ADDRESS,
        token0Symbol: 'USDC',
        token1Symbol: 'ETH',
        liquidity: ethers.formatUnits(usdcEthLiquidity, 6)
      });

      setPools(standardPools);

      // Fetch custom pools
      const [tokens, symbols, decimals, balances] = await simpleSwap.getCustomPools();
      const customPoolsData: CustomPool[] = tokens.map((token: string, index: number) => ({
        token,
        symbol: symbols[index],
        decimals: decimals[index],
        balance: ethers.formatUnits(balances[index], decimals[index])
      }));

      setCustomPools(customPoolsData);
    } catch (err) {
      console.error('Error fetching pools:', err);
      setError('Failed to fetch pools');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new pool with custom token
  const createCustomPool = async (tokenAddress: string) => {
    if (!window.ethereum) return false;
    setIsLoading(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const simpleSwap = new ethers.Contract(SIMPLE_SWAP_ADDRESS, SIMPLE_SWAP_ABI, signer);
      
      // Get token symbol
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const symbol = await tokenContract.symbol();

      // Create pool
      const tx = await simpleSwap.createPool(tokenAddress, symbol);
      await tx.wait();

      // Refresh pools
      await fetchPools();
      return true;
    } catch (err) {
      console.error('Error creating pool:', err);
      setError('Failed to create pool');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Swap 7ONE for other tokens (including custom tokens)
  const swap7ONEFor = async (
    amount: string,
    targetToken: string,
    slippageTolerance: number = 0.5
  ) => {
    if (!window.ethereum) return;
    setIsLoading(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const simpleSwap = new ethers.Contract(SIMPLE_SWAP_ADDRESS, SIMPLE_SWAP_ABI, signer);
      const sevenToken = new ethers.Contract(SEVEN_TOKEN_ADDRESS, ERC20_ABI, signer);

      // Get expected output amount
      const amountOut = await simpleSwap.getAmountOut(SEVEN_TOKEN_ADDRESS, targetToken, amount);
      const minOutput = amountOut * (1 - slippageTolerance / 100);

      // Approve SimpleSwap to spend 7ONE
      const approval = await sevenToken.approve(SIMPLE_SWAP_ADDRESS, amount);
      await approval.wait();

      // Execute swap
      const tx = await simpleSwap.swapTokens(
        SEVEN_TOKEN_ADDRESS,
        targetToken,
        amount,
        minOutput
      );
      await tx.wait();

      // Refresh pools after swap
      await fetchPools();
      return amountOut;
    } catch (err) {
      console.error('Error swapping tokens:', err);
      setError('Failed to swap tokens');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    pools,
    customPools,
    fetchPools,
    swap7ONEFor,
    createCustomPool
  };
} 