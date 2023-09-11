# GastroNFTs: A Blockchain-based Culinary Experience

## Introduction
Welcome to this experimental repository that aims to demonstrate various blockchain technologies through a culinary-themed NFT platform. Although the example doesn't serve a practical purpose, it exhibits how to build a scalable, secure, and robust platform using Solidity, Docker, and other essential tools.

![Solidity 0.8.18](https://img.shields.io/badge/Solidity-0.8.18-blue) ![Truffle 5.11.4](https://img.shields.io/badge/Truffle-5.11.4-blue) ![Ganache 7.9.1](https://img.shields.io/badge/Ganache-7.9.1-blue) ![Node 16.20.2](https://img.shields.io/badge/Node-16.20.2-blue) ![Slither 0.9.6](https://img.shields.io/badge/Slither-0.9.6-blue)

## Smart Contracts

There are three smart contracts in this repository. The decision to separate them into different contracts is based on several factors: maximum contract size, segregation of responsibilities, and upgradability, among others.

As said, the contracts are designed with upgradability in mind, although formal proxy contracts are not used. The contract addresses can be modified if necessary.

In case the AdminProbability or NFTGastroToken contracts need updating, their addresses can be simply changed in the GastroTokenPack contract. Conversely, if the GastroTokenPack contract requires an update, its address can be modified in the NFTGastroToken contract.

All functions are properly commented. In some cases, there are even inline comments within the code to clarify certain aspects of the development.

### AdminProbability
This contract plays a pivotal role in the generation of NFT IDs for each pack sold, ensuring a diversified and interesting user experience. It employs a Cumulative Distribution Function (CDF) to assign probabilistic weights to each NFT ID, thus accurately reflecting predetermined odds. The algorithm is meticulously designed to achieve a balanced distribution of NFTs within each pack, while also allowing for the thrill of rare finds.

### GastroTokenPack
This smart contract serves as the exclusive platform for the sale of curated NFT packs. Each pack includes a randomized assortment of tokens, the distribution of which is governed by the AdminProbability contract. Additionally, the contract allows for dynamic adjustments: you can modify both the sale price of each NFT pack and the number of NFTs included in each pack, offering greater flexibility and control over the user experience.

### NFTGastroToken
This smart contract is responsible for the comprehensive management of the lifecycle of each non-fungible token (NFT) within the system. It not only takes charge of the initial minting (emission) of new NFTs but also handles any subsequent revocation or burning of tokens.

Note: The URL 'gastrotoken.com' is provided solely as an illustrative example and does not represent an actual web address related to this project.

## Dockerization
Docker offers an environment that is easy to replicate across various stages of development and deployment. This tackles the age-old problem of "it works on my machine," ensuring that your application runs identically everywhere.

To start up the environment using Docker, navigate to the project's root directory and run the following command:

```
docker-compose up -d
```

This will start up all the required services in the background, as specified in your docker-compose.yml file.

## Testing
Comprehensive testing has been executed using [Truffle](https://trufflesuite.com/) for all contract functionalities. A total of 46 tests have been written to not only ensure that the functions are working as expected but also to cover negative test cases, such as unauthorized access by non-admin users. Ganache provides a local blockchain for testing, and contracts are first prototyped in [Remix](https://remix.ethereum.org/) before deployment.

![Truffle Logo](https://oscarpascual.com/logo-truffle.png) ![Test results](https://oscarpascual.com/testing-results.jpg)

To run the tests, navigate to the project's root directory and execute:

```
docker compose run --rm gastrotoken truffle test
```

This command will initiate all 46 test cases specified in the test files under the /test directory.


## Security
Security scans are carried out using [Slither](https://github.com/crytic/slither), encapsulated within a separate Docker container to ensure usage of its latest version (0.9.6 at the time of writing).

![Slither Logo](https://oscarpascual.com/logo-slither.png)

To initiate the security scans, navigate to the directory containing the Slither Dockerfile and execute:

```
docker compose run --rm slither slither . --exclude-dependencies
```

This will execute the security checks on the smart contracts.

However, to minimize the number of recommendations when submitting a PR, the following command should be executed:

```
docker compose run --rm slither slither . --exclude-dependencies --exclude-informational --exclude-low --exclude-optimization
```

## Randomization and Probability

GastroNFTs utilizes advanced algorithms to randomize the contents of each NFT pack, ensuring a unique and varied collection of tokens. One of the key algorithms deployed for this purpose is the Cumulative Distribution Function (CDF). Additionally, I've engineered a safeguard to prevent the same NFT from appearing multiple times within the same pack.

### Implementing the CDF Algorithm

Our system relies on the Cumulative Distribution Function (CDF) to probabilistically determine the types of NFTs included in each pack. [Learn more about CDF](https://en.wikipedia.org/wiki/Cumulative_distribution_function).

The pseudocode below outlines how I use CDF in our algorithm:

```
poolRandomNum = generateRandomNum(1, 10000)  // Generates a random number between 1 and 10000, representing a probability range of 0-100%.
selectedPoolName = ""

cumulativeProbability = 0
for j from 0 to number_of_pools:
    pool = pools[j]
    if pool.isActive():
        cumulativeProbability += pool.probability
        if poolRandomNum <= cumulativeProbability:
            selectedPoolName = pool.name
            break
```

Notably, the sequence in which the pools are arranged doesn't affect the randomization process. While the `getRandomNum` function offers sufficient randomness, the distribution of probabilities remains balanced.

I also use the following function to generate specific random numbers, where `_mod` is the maximum number desired and `_seed` is a value that increments with each call:

```
function createRandomNum(uint128 _mod, uint128 _seed) internal view returns (uint128) {
    bytes32 hash = keccak256(abi.encodePacked(
        block.timestamp,
        msg.sender,
        _seed
    ));
    return (uint128(uint256(hash)) % _mod) + 1;
}
```

### The Role of Chainlink VRF
While Chainlink VRF offers a secure and dependable approach to generating random numbers, I opted not to incorporate it in this development due to its associated gas costs. For more insight into Chainlink VRF, [click here](https://docs.chain.link/docs/get-a-random-number/).


## Deployment
Deploying smart contracts into a blockchain environment can be a meticulous task. To simplify and streamline the process, this repository includes well-documented migration files that handle deployment for you. These migration files are designed to accomplish several critical tasks.

The core smart contracts of this project are deployed to the blockchain in a sequence that ensures the system's overall integrity and functionality.  To minimize the gas costs associated with deployment, data is not loaded in constructors. Instead, specific functions, designed for this purpose, are called post-deployment to populate the necessary data.

The migration files are structured to allow for easy upgrades of the smart contracts. By simply updating the contract addresses in the migration files, you can deploy newer versions of `AdminProbability` and `NFTGastroToken` without affecting the `GastroTokenPack` contract, and vice versa.

The migration files are also responsible for loading predefined probability data into the `AdminProbability` contract.

To execute the deployment, navigate to the project's root directory and run:

```
truffle migrate --network <desired_network>
```

This will initiate the migration scripts, and if successful, you will see the new addresses of the deployed contracts along with other relevant information in the console.

## Alchemy App
An application on Alchemy has been set up for direct interaction with the contracts. Connection details are found in the `.env` file.

## Troubleshooting

If you encounter any issues, try reinstalling the failing module. For instance:

```bash
npm install @truffle/hdwallet-provider
```

## GitHub Actions
Automated checks are triggered whenever a Pull Request is made, ensuring code quality and security.

## Metadata
Example and filled metadata files are included in the repository.

## Configuration Files

### Truffle Configuration
This file contains settings for development, test (Mumbai), and production blockchains. It features the 0.8.18 compiler with an optimizer set for 200 runs and includes a plugin for contract verification, useful for PolygonScan.

### Slither Configuration
Excludes OpenZeppelin contracts from security checks, as they are beyond the control of this project and have already been verified. Additional checks are executed using command-line parameters.

---

Thank you for diving deep into this culinary NFT adventure! If you've made it this far and have any feedback, it would be more than welcome. Continuous improvement comes through community contributions.