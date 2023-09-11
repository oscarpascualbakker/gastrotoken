const AdminProbability = artifacts.require("AdminProbability");
const { expect } = require('chai');

const truffleAssert = require('truffle-assertions');

contract("AdminProbability", (accounts) => {
    let contract;
    const [owner, admin, user] = accounts;


    before(async () => {
        contract = await AdminProbability.new({ from: owner });

        await contract.setAdministrator(admin, true, { from: owner });

        await contract.loadGroups();
        await contract.loadNFTs();
        await contract.loadPoolNames();
    });


    beforeEach(async () => {
    });


    describe("createRandomNums", () => {
        it("should generate an array of random numbers", async () => {
            const amount = 3;
            const randomNums = await contract.createRandomNums(amount);

            assert.equal(randomNums.length, amount, "Length of random numbers array should be equal to amount");
        });
    });


    describe("setPool", () => {
        it("should allow the admin to set a new pool", async () => {
            await contract.setAdministrator(admin, true, { from: owner });

            const etherValue = web3.utils.toWei('0.5', 'ether');
            const tx = await contract.setPool("TestPool", 100, etherValue, 5, "Test pool", Date.now(), Date.now() + 86400, [1,2,3,4], { from: admin });
            const pool = await contract.getPool("TestPool");

            const {
                probability,
                price,
                nftsPerPack,
                description
            } = pool;

            assert.equal(probability.toString(), "100");
            assert.equal(price.toString(), "500000000000000000"); // 0,5 MATIC
            assert.equal(nftsPerPack.toString(), "5");
            assert.equal(description, "Test pool");

            // Check event PoolSet
            assert.equal(tx.logs[0].event, "PoolSet");
            assert.equal(tx.logs[0].args.name, "TestPool");
            assert.equal(tx.logs[0].args.nftsPerPack.toString(), "5");
            assert.equal(tx.logs[0].args.probability.toString(), "100");
        });

        it("should not allow non-admins to set a pool", async () => {
            const etherValue = web3.utils.toWei('0.5', 'ether');
            try {
                await contract.setPool("TestPool", 100, etherValue, 5, "Test pool", Date.now(), Date.now() + 86400, [1,2,3,4], { from: user });
                assert.fail();
            } catch (error) {
                assert(error.message.includes("You are not an administrator"));
            }
        });
    });


    describe("setPoolProbability", () => {
        beforeEach(async () => {
            await contract.setAdministrator(admin, true, { from: owner });

            const etherValue = web3.utils.toWei('0.5', 'ether');
            await contract.setPool("TestPool", 100, etherValue, 5, "Test pool", Date.now(), Date.now() + 86400, [1,2,3,4,5,6], { from: admin });
        });

        it('should check if a certain name exists in poolNames', async () => {
            const targetName = "TestPool";
            let doesExist = false;

            const poolNamesLength = await contract.getPoolNamesLength();

            for(let i = 0; i < poolNamesLength; i++) {
                const name = await contract.poolNames(i);
                if(name === targetName) {
                    doesExist = true;
                    break;
                }
            }

            assert.equal(doesExist, true, "The target name does not exist in poolNames");
        });

        it("should allow an admin to update pool probability", async () => {
            const newProbability = 50;
            await contract.setPoolProbability("TestPool", newProbability, { from: admin });

            const updatedPool= await contract.getPool("TestPool");
            assert.equal(updatedPool.probability, newProbability, "The pool probability has not been updated correctly");
        });

        it("should NOT allow non-admins to update pool probability", async () => {
            const newProbability = 50;

            try {
                await contract.setPoolProbability("TestPool", newProbability, { from: user });
                assert.fail("An exception was expected for non-admin users");
            } catch (error) {
                assert(error.message.includes("revert"), "An error with 'revert' was expected");
            }
        });

        it("should not allow updating probability of a non-existent pool", async () => {
            const newProbability = 50;

            try {
                await contract.setPoolProbability("Nom_no_existent", newProbability, { from: admin });
                assert.fail("An exception was expected for a non-existent pool");
            } catch (error) {
                assert(error.message.includes("revert"), "An error with 'revert' was expected");
            }
        });
    });


    describe("getPool", () => {
        beforeEach(async () => {
            const etherValue = web3.utils.toWei('0.5', 'ether');
            await contract.setPool("TestPool", 100, etherValue, 5, "Test pool", Date.now(), Date.now() + 86400, [1,2,3,4], { from: admin });
        });

        it("should retrieve pool details correctly", async () => {
            const pool = await contract.getPool("TestPool");

            assert.equal(pool.probability.toString(), "100");
            assert.equal(pool.price.toString(), "500000000000000000");  // 0,5 MATIC
            assert.equal(pool.nftsPerPack.toString(), "5");
            assert.equal(pool.description, "Test pool");
        });
    });


    describe('setTotalNFTs', () => {
        it('should allow admin to set total NFTs', async () => {
            const newTotal = 5000;

            // L'havíem tret, abans.
            await contract.setAdministrator(admin, true, { from: owner });

            let tx = await contract.setTotalNFTs(newTotal, { from: admin });
            let result = await contract.totalNFTs();

            assert.equal(result.toString(), newTotal.toString(), "Total NFTs not set correctly");
        });

        it('should NOT allow non-admin to set total NFTs', async () => {
            await truffleAssert.reverts(
                contract.setTotalNFTs(5000, { from: accounts[2] }),
                "You are not an administrator"
            );
        });

        it('should NOT allow setting totalNFTs to a lower value', async () => {
            await truffleAssert.reverts(
                contract.setTotalNFTs(500, { from: admin }),
                "The new total cannot be less than the current total"
            );

            const currentTotal = await contract.totalNFTs();
            assert.equal(currentTotal.toString(), '5000', "Total NFTs should still be 5000");
        });
    });

});
