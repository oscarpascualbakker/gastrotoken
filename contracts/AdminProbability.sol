// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract AdminProbability {

    struct Pool {
        uint256 probability;
        uint256 price;
        uint256 nftsPerPack;
        string description;
        uint256 startDate;
        uint256 endDate;
        uint128[] nftIDs;
    }

    address public immutable owner;

    uint128 public totalNFTs;
    mapping(string => Pool) public pools;
    string[] public poolNames;

    mapping(address => bool) public administrators;


    event PoolSet(string name, uint256 probability, uint256 price, uint256 nftsPerPack, string description, uint256 startDate, uint256 endDate);
    event PoolProbabilitySet(string name, uint256 nuevaProbabilidad);


    constructor() {
        owner = msg.sender;
        administrators[msg.sender] = true;  // The owner is the first administrator.

        // Total different NFTs that can be minted
        totalNFTs = 150;
    }


    function loadGroups() external onlyOwner {
        // Initialization of the pools
        pools["Classic Tapas"]                          = Pool(2000, 2, 3, "Classic Spanish Tapas",                  1693526400, 1893455999, new uint128[](0));
        pools["Traditional Main Courses"]               = Pool(1500, 2, 3, "Traditional Main Courses",               1693526400, 1893455999, new uint128[](0));
        pools["Seafood and Fish"]                       = Pool(1500, 2, 3, "Seafood and Fish",                       1693526400, 1893455999, new uint128[](0));
        pools["Meats"]                                  = Pool(1000, 2, 3, "Meats",                                  1693526400, 1893455999, new uint128[](0));
        pools["Vegetarian/Vegan"]                       = Pool(1000, 2, 3, "Vegetarian/Vegan",                       1693526400, 1893455999, new uint128[](0));
        pools["Traditional Desserts"]                   = Pool(1000, 2, 3, "Traditional Desserts",                   1693526400, 1893455999, new uint128[](0));
        pools["Modern Fusion"]                          = Pool( 500, 2, 3, "Modern Fusion",                          1693526400, 1893455999, new uint128[](0));
        pools["Michelin Star"]                          = Pool( 200, 2, 3, "Michelin Star Dishes",                   1693526400, 1893455999, new uint128[](0));
        pools["Beverages"]                              = Pool(1000, 2, 3, "Beverages",                              1693526400, 1893455999, new uint128[](0));
        pools["Special Edition - Festivals and Events"] = Pool( 300, 2, 3, "Special Edition - Festivals and Events", 1693526400, 1893455999, new uint128[](0));
    }


    function loadNFTs() external onlyOwner {
        // Assignment of NFT IDs to each group
        pools["Classic Tapas"].nftIDs                          = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
        pools["Traditional Main Courses"].nftIDs               = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34];
        pools["Seafood and Fish"].nftIDs                       = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46];
        pools["Meats"].nftIDs                                  = [47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
        pools["Vegetarian/Vegan"].nftIDs                       = [58, 59, 60, 61, 62, 63, 64, 65, 66, 67];
        pools["Traditional Desserts"].nftIDs                   = [68, 69, 70, 71, 72, 73, 74, 75];
        pools["Modern Fusion"].nftIDs                          = [76, 77, 78, 79, 80, 81, 82];
        pools["Michelin Star"].nftIDs                          = [83, 84, 85, 86];
        pools["Beverages"].nftIDs                              = [87, 88, 89, 90, 91, 92, 93, 94, 95, 96];
        pools["Special Edition - Festivals and Events"].nftIDs = [97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150];
    }


    function loadPoolNames() external onlyOwner {
        // Adding the group names to the array of names
        poolNames = [
            "Classic Tapas",
            "Traditional Main Courses",
            "Seafood and Fish",
            "Meats",
            "Vegetarian/Vegan",
            "Traditional Desserts",
            "Modern Fusion",
            "Michelin Star",
            "Beverages",
            "Special Edition - Festivals and Events"
        ];
    }


    /**
     * @notice Creates an array of random IDs for GastroTokens.
     * @param _amount Specifies the number of random numbers to generate.
     * @return randomNums Returns an array of uint128 containing the randomly generated GastroToken IDs.
     */
    function createRandomNums(uint8 _amount) external view returns (uint128[] memory) {
        require(_amount <= totalNFTs, "Can't generate more unique numbers than total NFTs.");

        uint128 seed = 999983;  // Why does it have to be zero? Let it be a very large prime number. :-)
        uint128[] memory randomNums = new uint128[](_amount);

        for (uint128 i = 0; i < _amount; i++) {
            uint128 gastroTokenId;

            // Generate a random number to choose a pool
            uint128 poolRandomNum = uint128(createRandomNum(10000, seed++)); // Between 1 and 10000
            string memory selectedPoolName = "";

            // Choose a pool based on probability
            uint256 cumulativeProbability = 0;
            uint256 poolLength = poolNames.length;
            for (uint j = 0; j < poolLength; j++) {
                string memory poolName = poolNames[j];
                Pool memory pool = pools[poolName];

                if (pool.endDate > block.timestamp) {
                    cumulativeProbability += pool.probability;

                    if (poolRandomNum <= cumulativeProbability) {
                        selectedPoolName = poolName;
                        break;
                    }
                }
            }

            Pool memory selectedPool = pools[selectedPoolName];
            require(selectedPool.nftIDs.length > 0, "Selected pool is empty.");

            do {
                // Generate a random number between 1 and the length of the selected pool's IDs
                uint128 idRandomNum = uint128(createRandomNum(uint128(selectedPool.nftIDs.length), seed++));

                // Get the ID of the corresponding GastroToken for the generated number
                gastroTokenId = selectedPool.nftIDs[idRandomNum - 1]; // Arrays are 0-indexed!
            } while (_isIdInArray(gastroTokenId, randomNums, i));

            // Add the number to the array of random numbers to return
            randomNums[i] = gastroTokenId;
        }

        return randomNums;
    }


    /**
     * @notice Creates a random number using keccak256.
     * @param _mod The modulo by which the residue operation will be performed.
     * @param _seed An additional seed for generating the random number.
     * @return Returns a uint128 which is the generated random number.
     */
    function createRandomNum(uint128 _mod, uint128 _seed) internal view returns (uint128) {
        bytes32 hash = keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender,
            _seed
        ));
        // slither-disable-next-line weak-prng
        return (uint128(uint256(hash)) % _mod) + 1;
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
     * @notice Adds a list of NFTs to an existing pool.
     * @param name The name of the pool where the NFTs are to be added.
     * @param newNFTIDs An array with the IDs of the NFTs to be added to the pool.
     * @dev Only an administrator can call this function.
     */
    function addNFTsToPool(string memory name, uint128[] memory newNFTIDs) public onlyAdministrator() {
        Pool storage pool = pools[name];
        for(uint i = 0; i < newNFTIDs.length; i++) {
            pool.nftIDs.push(newNFTIDs[i]);
        }
    }


    /**
     * @notice Configures or updates a pool with the provided data.
     * @param name The name of the pool to be configured.
     * @param probability The probability associated with the pool.
     * @param price The price of each NFT pack in this pool.
     * @param nftsPerPack The number of NFTs contained in each pack.
     * @param description A textual description of the pool.
     * @param startDate The start date when the pool becomes available.
     * @param endDate The end date when the pool becomes unavailable.
     * @param ids An array with the IDs of the NFTs to be included in the pool.
     * @dev Only an administrator can call this function.
     *      This function also emits a `PoolSet` event when the pool is successfully configured.
     */
    function setPool(
        string memory name,
        uint256 probability,
        uint256 price,
        uint256 nftsPerPack,
        string memory description,
        uint256 startDate,
        uint256 endDate,
        uint128[] memory ids
    ) external onlyAdministrator {
        pools[name] = Pool(probability, price, nftsPerPack, description, startDate, endDate, new uint128[](0));
        poolNames.push(name);
        addNFTsToPool(name, ids);
        emit PoolSet(name, probability, price, nftsPerPack, description, startDate, endDate);
    }


    /**
     * @notice Returns the length of the array of pool names.
     * @return The number of available pool names.
     */
    function getPoolNamesLength() external view returns (uint256) {
        return poolNames.length;
    }


    /**
     * @notice Returns the information for the pool with the specified name.
     * @param _name The name of the pool to be queried.
     * @return pool The complete information for the requested pool.
     */
    function getPool(string memory _name) external view returns (Pool memory pool) {
        return pools[_name];
    }


    /**
     * @notice Sets a new probability for an existing pool.
     * @param _name The name of the pool to modify the probability.
     * @param _newProbability The new probability to assign to the pool.
     * @dev Throws an error if the pool does not exist.
     */
    function setPoolProbability(string memory _name, uint256 _newProbability) external onlyAdministrator {
        require(pools[_name].nftIDs.length != 0, "El pool no existeix");
        pools[_name].probability = _newProbability;
        emit PoolProbabilitySet(_name, _newProbability);
    }


    /**
     * @notice Sets the total available NFTs.
     * @param _newTotal New total of available NFTs.
     */
    function setTotalNFTs(uint128 _newTotal) external onlyAdministrator {
        require(_newTotal >= totalNFTs, "The new total cannot be less than the current total");
        totalNFTs = _newTotal;
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
     * @notice Checks if an ID is contained in the array.
     * @param id ID to check.
     * @param array Array to search for the ID.
     * @param length Length of the array to search.
     * @return bool true if the ID is found in the array, false otherwise.
     */
    function _isIdInArray(uint128 id, uint128[] memory array, uint128 length) private pure returns (bool) {
        for(uint8 i = 0; i < length; i++) {
            if(array[i] == id) {
                return true;
            }
        }
        return false;
    }

}
