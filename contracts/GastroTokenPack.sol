// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./NFTGastroToken.sol";
import "./AdminProbability.sol";

contract GastroTokenPack {
    NFTGastroToken public nftContract;
    AdminProbability public adminProbabilityContract;

    uint256 public packPrice = 2 ether;
    uint8 public NFTsPerPack = 3;

    address public immutable owner;
    mapping(address => bool) public administrators;


    /**
     * @notice Constructor that initializes the contract.
     * @param _nftContract Address of the NFTGastroToken contract.
     * @param _adminProbability Address of the AdminProbability contract.
     */
    constructor(address _nftContract, address _adminProbability) {
        owner = msg.sender;
        administrators[msg.sender] = true;

        nftContract = NFTGastroToken(_nftContract);
        adminProbabilityContract = AdminProbability(_adminProbability);
    }


    /**
     * @notice Purchase a pack containing NFTs.
     */
    function buyPack() external payable {
        require(msg.value == packPrice, "Send the exact pack price, please");

        uint128[] memory randomNums = getRandomNums(NFTsPerPack);

        for(uint8 i = 0; i < NFTsPerPack; i++) {
            uint128 id = randomNums[i];
            nftContract.mintGastroToken(msg.sender, id);
        }

        // Transfer amount to contract owner
        payable(owner).transfer(msg.value);
    }


    //============================================
    // Modifiers
    //============================================

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }


    modifier onlyAdministrator() {
        require(administrators[msg.sender], "You are not an administrator");
        _;
    }


    //============================================
    // Helper Functions
    //============================================

    /**
     * @notice Gets a random ID to use for minting a new NFT
     * @param _size The number of random numbers we want to receive
     * @return array An array with the '_size' random numbers
     */
    function getRandomNums(uint8 _size) public view returns (uint128[] memory) {
        return adminProbabilityContract.createRandomNums(_size);
    }


    /**
     * @notice Sets the pack price.
     * @param _newPrice New price for the pack.
     */
    function setPackPrice(uint256 _newPrice) external onlyAdministrator {
        packPrice = _newPrice;
    }


    /**
     * @notice Sets the number of NFTs per pack.
     * @param _newAmount New number of NFTs per pack.
     */
    function setNFTsPerPack(uint8 _newAmount) external onlyAdministrator {
        NFTsPerPack = _newAmount;
    }


    /**
     * @notice Sets or disables an address as administrator.
     * @param _admin Address to enable or disable as administrator.
     * @param _status State to set, 'true' to enable, 'false' to disable.
     */
    function setAdministrator(address _admin, bool _status) external onlyOwner {
        administrators[_admin] = _status;
    }


    /**
     * @notice Allows the owner to change the NFTGastroToken contract address.
     * @param _newNFTContract The new NFTGastroToken contract address.
     */
    function setNFTGastroTokenAddress(address _newNFTContract) external onlyOwner {
        nftContract = NFTGastroToken(_newNFTContract);
    }


    /**
     * @notice Allows the owner to change the AdminProbability contract address.
     * @param _newAdminProbability The new AdminProbability contract address.
     */
    function setAdminProbabilityAddress(address _newAdminProbability) external onlyOwner {
        adminProbabilityContract = AdminProbability(_newAdminProbability);
    }

}
