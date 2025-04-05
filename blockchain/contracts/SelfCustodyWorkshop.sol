// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SelfCustodyWorkshop is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Mapping to track if a user has completed the workshop
    mapping(address => bool) public hasCompletedWorkshop;
    
    // Mapping to track if a user has claimed their NFT
    mapping(address => bool) public hasClaimedNFT;

    // Workshop completion event
    event WorkshopCompleted(address indexed user, uint256 timestamp);
    
    // NFT claim event
    event NFTClaimed(address indexed user, uint256 tokenId);

    constructor() ERC721("Self Custody Workshop", "SCW") {}

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

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);
        
        // Set token URI - this would point to the metadata JSON
        _setTokenURI(newTokenId, "ipfs://YOUR_METADATA_CID");

        hasClaimedNFT[msg.sender] = true;
        emit NFTClaimed(msg.sender, newTokenId);
    }

    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    // Admin function to set token URI if needed
    function setTokenURI(uint256 tokenId, string memory _tokenURI) external onlyOwner {
        _setTokenURI(tokenId, _tokenURI);
    }
} 