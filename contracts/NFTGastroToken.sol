// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract NFTGastroToken is ERC1155 {

    // The name and symbol variables, which are not used throughout the contract,
    // are used by wallets to name collections.
    string public constant name = "GastroToken";
    string public constant symbol = "NFTGT";

    string public collectionName = "GastroToken";

    string private baseURI;

    address public immutable owner;
    address public gastroTokenPackAddress;

    mapping(address => bool) public administrators;

    uint256 public totalTokensMinted = 0;


    event GastroTokenMinted(uint256 tokenId);


    constructor(address _gastroTokenPackAddress) ERC1155("") {
        owner = msg.sender;
        administrators[msg.sender] = true; // The owner is also the first administrator

        baseURI = "https://gastrotoken.com/metadata/";
        _setURI(baseURI);

        if(_gastroTokenPackAddress != address(0)) {
            gastroTokenPackAddress = _gastroTokenPackAddress;
        }
    }


    /**
     * @notice Mints a specific NFT and assigns it to an address.
     * @param _to The address that will receive the NFT.
     * @param _id The ID of the NFT to be minted.
     */
    function mintGastroToken(address _to, uint256 _id) external onlySobresOrAdmin {
        _mint(_to, _id, 1, "");

        totalTokensMinted++;

        emit GastroTokenMinted(_id);
    }


    /**
     * @notice Burns a specific NFT from the specified address.
     * @param _from The address from which the NFT will be burned.
     * @param _id The ID of the NFT to be burned.
     */
    function revokeGastroToken(address _from, uint256 _id) external onlySobresOrAdmin {
        require(balanceOf(_from, _id) > 0, "Address does not own the NFT");
        _burn(_from, _id, 1);
    }


    //============================================
    // Modifiers
    //============================================

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }


    modifier onlySobresOrAdmin() {
        require(msg.sender == gastroTokenPackAddress || administrators[msg.sender], "You are not authorized");
        _;
    }


    //============================================
    // Helper Functions
    //============================================

    /**
     * @notice Allows the owner to set the collection name.
     * @param _name The new collection name to set.
     */
    function setCollectionName(string memory _name) external onlyOwner {
        collectionName = _name;
    }


    /**
     * @notice Set or disable an address as administrator.
     * @param _admin The address to enable or disable as administrator.
     * @param _status The state, 'true' to enable, 'false' to disable.
     */
    function setAdministrator(address _admin, bool _status) external onlyOwner {
        administrators[_admin] = _status;
    }


    /**
     * @notice Returns the total number of tokens minted.
     * @return uint256 The total number of tokens minted.
     */
    function getTotalTokensMinted() external view returns (uint256) {
        return totalTokensMinted;
    }


    /**
     * @notice Allows the owner to set the base URI.
     * @param _baseURI The new base URI to set.
     */
    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
        _setURI(_baseURI);
    }


    /**
     * @notice Overrides the ERC1155 uri function to return the URI of a specific token.
     * @param tokenId The ID of the token.
     * @return string The URI string.
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory tokenIdStr = Strings.toString(tokenId);
        return string(abi.encodePacked(baseURI, "metadata-", tokenIdStr, ".json"));
    }


    /**
     * @notice Allows the owner to set the GastroTokenPack contract address.
     * @param _address The new address to set.
     */
    function setGastroTokenPackAddress(address _address) external onlyOwner {
        gastroTokenPackAddress = _address;
    }

}
