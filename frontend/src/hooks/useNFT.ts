// src/hooks/useNFT.ts

import { useState } from 'react';
import { ethers } from 'ethers';

// NFT contract address
const NFT_CONTRACT_ADDRESS = '0x60AAdb125ba1AfCA367c2ce3437BeE22Df28D270';

// Minimal ABI for checking NFT ownership
const NFT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)"
];

interface NFTDetails {
  contractAddress: string;
  tokenId: string;
  owner: string;
  balance: string;
}

export function useNFT() {
  const [hasNFT, setHasNFT] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nftDetails, setNftDetails] = useState<NFTDetails | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  const checkNFTOwnership = async (userAddress: string) => {
    // If we've already checked and found NFTs, don't check again
    if (hasChecked && hasNFT) {
      return true;
    }

    if (!window.ethereum || !userAddress) {
      setError("Ethereum provider or user address not available");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Creating provider and contract instance...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);

      // Check if user has any NFTs
      console.log('Checking NFT balance...');
      const balance = await nftContract.balanceOf(userAddress);
      console.log('NFT Balance:', balance.toString());
      
      // If balance is greater than 0, they have NFTs
      const hasNFTs = balance > 0;
      setHasNFT(hasNFTs);
      
      if (hasNFTs) {
        const details: NFTDetails = {
          contractAddress: NFT_CONTRACT_ADDRESS,
          tokenId: "N/A", // We don't need specific token ID if we just check balance
          owner: userAddress,
          balance: balance.toString()
        };
        
        setNftDetails(details);
        console.log('NFT Details set:', details);
      } else {
        console.log('No NFTs found for address:', userAddress);
        setNftDetails(null);
      }

      setHasChecked(true);
      return hasNFTs;
    } catch (err) {
      console.error("Error checking NFT ownership:", err);
      setError("Failed to check NFT ownership");
      setNftDetails(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hasNFT,
    isLoading,
    error,
    checkNFTOwnership,
    nftDetails,
    hasChecked
  };
}