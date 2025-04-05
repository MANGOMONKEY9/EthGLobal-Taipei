// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SelfCustodyWorkshop is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Mapping to track if a user has completed the workshop
    mapping(address => bool) public hasCompletedWorkshop;
    
    // Mapping to track if a user has claimed their NFT
    mapping(address => bool) public hasClaimedNFT;

    // Workshop completion event
    event WorkshopCompleted(address indexed user, uint256 timestamp);
    
    // NFT claim event
    event NFTClaimed(address indexed user, uint256 tokenId);

    constructor() ERC721("Self Custody Workshop", "SCW") Ownable(msg.sender) {}

    // Function to mark workshop as completed for a user
    function completeWorkshop() external {
        require(!hasCompletedWorkshop[msg.sender], "Workshop already completed");
        
        hasCompletedWorkshop[msg.sender] = true;
        emit WorkshopCompleted(msg.sender, block.timestamp);
    }

    // Function to check if user has completed workshop
    function isWorkshopCompleted(address user) external view returns (bool) {
        return hasCompletedWorkshop[user];
    }

    // Function to claim NFT after workshop completion
    function claimNFT() external {
        require(hasCompletedWorkshop[msg.sender], "Must complete workshop first");
        require(!hasClaimedNFT[msg.sender], "NFT already claimed");

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        
        // Set token URI - this would point to the metadata JSON
        _setTokenURI(tokenId, "ipfs://YOUR_METADATA_CID");

        hasClaimedNFT[msg.sender] = true;
        emit NFTClaimed(msg.sender, tokenId);
    }

    // Admin function to set token URI if needed
    function setTokenURI(uint256 tokenId, string memory _tokenURI) external onlyOwner {
        _setTokenURI(tokenId, _tokenURI);
    }
} 