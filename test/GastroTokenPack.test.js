const NFTGastroToken = artifacts.require("NFTGastroToken");
const AdminProbability = artifacts.require("AdminProbability");
const GastroTokenPack = artifacts.require("GastroTokenPack");

const truffleAssert = require('truffle-assertions');


contract("GastroTokenPack", accounts => {
    let nftContract;
    let probabilitatsContract;
    let packContract;
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
    const [owner, admin, user] = accounts;

    before(async () => {
        nftContract = await NFTGastroToken.deployed();
        probabilitatsContract = await AdminProbability.deployed();

        packContract = await GastroTokenPack.new(
            nftContract.address,
            probabilitatsContract.address
        );

        nftContract.setGastroTokenPackAddress(packContract.address);

        await packContract.setAdministrator(admin, true, { from: owner });
    });


    describe('constructor', () => {
        it("should set the correct owner", async () => {
            const contractOwner = await packContract.owner();
            assert.equal(contractOwner, owner);
        });
    });


    describe("getRandomNums", function() {
        it("should generate the correct number of random numbers", async function() {
            const NFTsPerPack = await packContract.NFTsPerPack();
            const randomNums = await packContract.getRandomNums(NFTsPerPack);

            expect(randomNums.length).to.equal(NFTsPerPack.toNumber());
        });

        it("should generate random numbers within the correct range", async function() {
            const NFTsPerPack = await packContract.NFTsPerPack();
            const totalNFTs = await probabilitatsContract.totalNFTs();
            const randomNums = await packContract.getRandomNums(NFTsPerPack);

            for (let i = 0; i < randomNums.length; i++) {
                expect(randomNums[i].toNumber()).to.be.at.least(1);
                expect(randomNums[i].toNumber()).to.be.at.most(totalNFTs.toNumber());
            }
        });
    });


    describe('buyPack', () => {
        it("should reject if incorrect amount is sent", async function() {
            try {
                await packContract.buyPack({from: user, value: web3.utils.toWei("0.5", "ether")});
                assert.fail("Expected to throw but did not");
            } catch(error) {
                assert(error.message.includes("Send the exact pack price, please"), "Unexpected error message");
            }
        });

        it("should buy a pack and mint NFTs", async function() {
            const NFTsPerPack = 3;
            const packPrice = await packContract.packPrice();

            // Owner balance before buy...
            const initialOwnerBalance = web3.utils.toBN(await web3.eth.getBalance(owner));

            await packContract.buyPack({from: user, value: packPrice});

            // Verify that amount has been transfered to the owner
            const newOwnerBalance = web3.utils.toBN(await web3.eth.getBalance(owner));

            assert.equal(newOwnerBalance.toString(), initialOwnerBalance.add(packPrice).toString(), "Owner should receive packPrice");

            // Verify events TransferSingle and GastroTokenMinted
            const transferEvents = await nftContract.getPastEvents("TransferSingle", {fromBlock: 0});
            const mintEvents = transferEvents.filter(e => e.args.from === ZERO_ADDRESS);

            expect(mintEvents.length).to.equal(NFTsPerPack);

            // Verify the user ownes the tokens
            for(let event of mintEvents) {
                const tokenId = event.args.id;
                const balance = await nftContract.balanceOf(user, tokenId);

                assert.equal(balance.toString(), '1', "User should own 3 NFTs after buying a pack");
            }
        });
    });


    describe('setAdministrator', () => {
        it('should allow owner to set admin', async () => {
            const newAdmin = accounts[1];
            await packContract.setAdministrator(newAdmin, true, { from: owner });
            expect(await packContract.administrators(newAdmin)).to.be.true;
        });

        it('should NOT allow non-owner to set admin', async () => {
            await truffleAssert.reverts(
                packContract.setAdministrator(accounts[3], true, { from: accounts[2] }),
                "You are not the owner"
            );
        });

        it('should allow owner to unset admin', async () => {
            await packContract.setAdministrator(admin, false, { from: owner });
            expect(await packContract.administrators(admin)).to.be.false;
        });

        it('should NOT allow non-owner to unset admin', async () => {
            try {
                await packContract.setAdministrator(admin, false, { from: accounts[3] })
                assert.fail();
            } catch (err) {
                assert(err.message.includes("You are not the owner"));
            }
        });
    });


    describe('setNFTsPerPack', () => {
        it('should allow owner to set NFTs per pack', async () => {
            const newAmount = 5;
            let tx = await packContract.setNFTsPerPack(newAmount, { from: owner });
            let result = await packContract.NFTsPerPack();

            assert.equal(result.toString(), newAmount.toString(), "NFTs per pack not set correctly");
        });

        it('should NOT allow non-owner to set NFTs per pack', async () => {
            try {
                await packContract.setNFTsPerPack(5, { from: accounts[2] });
                assert.fail();
            } catch (err) {
                assert(err.message.includes("You are not an administrator"));
            }
        });
    });


    describe('setPackPrice', () => {
        it("should allow owner to set pack price", async () => {
            const newPrice = web3.utils.toWei("2", "ether");
            await packContract.setPackPrice(newPrice, { from: owner });
            const currentPackPrice = await packContract.packPrice();
            assert.equal(currentPackPrice.toString(), newPrice);
        });

        it("should not allow non-admin to set pack price", async () => {
            try {
                await packContract.setPackPrice(web3.utils.toWei("1", "ether"), { from: user });
                assert.fail();
            } catch (err) {
                assert(err.message.includes("You are not an administrator"));
            }
        });
    });


    describe('setNFTGastroTokenAddress', () => {
        it("should allow owner to set new NFT contract address", async () => {
            const newNFTContract = await NFTGastroToken.new(ZERO_ADDRESS);
            await packContract.setNFTGastroTokenAddress(newNFTContract.address, { from: owner });
            const currentNFTContract = await packContract.nftContract();
            assert.equal(currentNFTContract, newNFTContract.address, "Failed to set new NFT contract address");
        });

        it("should not allow non-owner to set new NFT contract address", async () => {
            const newNFTContract = await NFTGastroToken.new(ZERO_ADDRESS);
            try {
                await packContract.setNFTGastroTokenAddress(newNFTContract.address, { from: user });
                assert.fail("Expected error not encountered");
            } catch (error) {
                assert.isTrue(error.message.includes("You are not the owner"), "Unexpected error message");
            }
        });
    });


    describe('setAdminProbabilityAddress', () => {
        it("should allow owner to set new AdminProbability contract address", async () => {
            const newAdminProbability = await AdminProbability.new();
            await packContract.setAdminProbabilityAddress(newAdminProbability.address, { from: owner });
            const currentAdminProbability = await packContract.adminProbabilityContract();
            assert.equal(currentAdminProbability, newAdminProbability.address, "Failed to set new AdminProbability contract address");
        });

        it("should not allow non-owner to set new AdminProbability contract address", async () => {
            const newAdminProbability = await AdminProbability.new();
            try {
                await packContract.setAdminProbabilityAddress(newAdminProbability.address, { from: user }); // 'user' no es el propietario
                assert.fail("Expected error not encountered");
            } catch (error) {
                assert.isTrue(error.message.includes("You are not the owner"), "Unexpected error message");
            }
        });
    });

});
