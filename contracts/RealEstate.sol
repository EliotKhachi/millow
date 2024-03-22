//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// Import OpenZeppelin contracts to help us build our own ERC721 contract for our NFTs
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';

contract RealEstate is ERC721URIStorage { // inherits ERC721URIStorage behavior
  // Create an enumerable ERC721 token
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  // Create a constructor to set the name and symbol of the NFT
  constructor() ERC721("RealEstate", "REAL") {}

  // Create a function to mint/buy a new NFT
  function mint(string memory tokenURI) public returns (uint256) {
    _tokenIds.increment(); // Increment the tokenIds counter

    uint256 newItemId = _tokenIds.current(); // Get the current value of tokenIds
    _mint(msg.sender, newItemId); // Mint a new NFT with the current value of tokenIds
    _setTokenURI(newItemId, tokenURI); // Set the tokenURI for the new NFT

    return newItemId; // Return the new token ID
  }

  // Create a function to get the total supply of NFTs
  function totalSupply() public view returns (uint256) {
    return _tokenIds.current();
  }

}