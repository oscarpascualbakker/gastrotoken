const { expect } = require('chai');
const truffleAssert = require('truffle-assertions');
const NFTGastroToken = artifacts.require("NFTGastroToken");

contract('NFTGastroToken', function(accounts) {
    let contract;
    const owner = accounts[0];
    const admin = accounts[1];
    const user = accounts[2];
    const gastroTokenPack = accounts[3];
    const tokenId = 1;

    beforeEach(async () => {
        contract = await NFTGastroToken.new(owner);
    });


    describe('constructor', () => {
        it('should deploy and set owner correctly', async () => {
            expect(await contract.owner()).to.equal(owner);
        });
    });


    describe('setGastroTokenPackAddress', () => {
        it('should allow owner to set GastroTokenPack address', async () => {
            await contract.setGastroTokenPackAddress(gastroTokenPack, {from: owner});
            expect(await contract.gastroTokenPackAddress()).to.equal(gastroTokenPack);
        });

        it('should not allow non-owner to set GastroTokenPack address', async () => {
            await truffleAssert.reverts(
                contract.setGastroTokenPackAddress(gastroTokenPack, {from: user}),
                "You are not the owner"
            );
        });
    });


    describe('mintGastroToken', () => {
        it('should mint a new GastroToken', async () => {
            await contract.setGastroTokenPackAddress(gastroTokenPack, {from: owner});
            await contract.mintGastroToken(user, tokenId, {from: gastroTokenPack});

            const balance = await contract.balanceOf(user, tokenId);
            expect(balance.toNumber()).to.equal(1);
        });

        it('should allow admin to mint a GastroToken', async () => {
            await contract.setAdministrator(admin, true, {from: owner});
            await contract.mintGastroToken(user, tokenId, {from: admin});

            const balance = await contract.balanceOf(user, tokenId);
            expect(balance.toNumber()).to.equal(1);
        });

        it('should not allow unauthorized user to mint GastroToken', async () => {
            await truffleAssert.reverts(
                contract.mintGastroToken(user, tokenId, {from: user}),
                "You are not authorized"
            );
        });

        it("should increment totalTokensMinted when a new NFT is minted", async function() {
            let initialTokenId = await contract.getTotalTokensMinted();
            await contract.mintGastroToken(user, 1, {from: owner});

            let newTokenId = await contract.getTotalTokensMinted();
            assert.equal(newTokenId.toNumber(), initialTokenId.toNumber() + 1, "totalTokensMinted no s'ha incrementat correctament");
        });
    });


    describe('revokeGastroToken', () => {
        beforeEach(async () => {
            await contract.setAdministrator(admin, true, { from: owner });
            await contract.mintGastroToken(user, tokenId, { from: admin });
        });

        it("should allow admin to revoke a token from a user", async () => {
            const initialBalance = await contract.balanceOf(user, tokenId);
            assert.equal(initialBalance, 1, "Initial balance should be 1");

            await contract.revokeGastroToken(user, tokenId, { from: owner });

            const finalBalance = await contract.balanceOf(user, tokenId);
            assert.equal(finalBalance, 0, "Final balance should be 0");
        });

        it("should not allow non-admin to revoke a token", async () => {
            try {
                await contract.revokeGastroToken(user, tokenId, { from: user });
                assert.fail("Expected error not encountered");
            } catch (error) {
                assert.isTrue(error.message.includes("You are not authorized"), "Unexpected error message");
            }
        });

        it("should not allow admin to revoke a token that the address does not own", async () => {
            const otherUser = accounts[3];

            try {
                await contract.revokeGastroToken(otherUser, tokenId, { from: admin });
                assert.fail("Expected error not encountered");
            } catch (error) {
                assert.isTrue(error.message.includes("Address does not own the NFT"), "Unexpected error message");
            }
        });
    });


    describe('setBaseURI', () => {
        it("should return the correct URI for a given tokenId", async () => {
            const tokenId = 271;

            const expectedUri = "https://gastrotoken.com/metadata/metadata-271.json";
            const actualUri = await contract.uri(tokenId);

            assert.equal(actualUri, expectedUri, "URI returned by contract does not match expected URI");
        });

        it("should allow the owner to set a new base URI", async () => {
            const newBaseURI = "https://example.com/newbase/";

            await contract.setBaseURI(newBaseURI, { from: owner });

            const tokenId = 412;

            const expectedUri = "https://example.com/newbase/metadata-412.json";
            const actualUri = await contract.uri(tokenId);

            assert.equal(actualUri, expectedUri, "URI returned by contract does not match expected URI after setting new base URI");
        });

        it("should return the correct metadata for a minted NFT", async () => {
            const tokenId = 442;
            await contract.mintGastroToken(user, tokenId, { from: owner });

            const expectedURI = "https://gastrotoken.com/metadata/metadata-442.json";
            const actualURI = await contract.uri(tokenId);

            assert.equal(actualURI, expectedURI, "Metadata URI does not match expected URI");
        });
    });


    describe('setAdministrator', () => {
        it("should allow owner to set new administrator", async () => {
            await contract.setAdministrator(admin, true, { from: owner });
            const isAdmin = await contract.administrators(admin);
            assert.equal(isAdmin, true, "Failed to set new administrator");
        });

        it("should not allow non-owner to set new administrator", async () => {
            try {
                await contract.setAdministrator(admin, true, { from: user });
                assert.fail("Expected error not encountered");
            } catch (error) {
                assert.isTrue(error.message.includes("You are not the owner"), "Unexpected error message");
            }

            const isAdmin = await contract.administrators(admin);
            assert.equal(isAdmin, false, "Non-owner should not be able to set new administrator");
        });

    });


    describe('getTotalTokensMinted', () => {
        it('should return correct total tokens minted', async () => {
            // Mint a new token
            await contract.mintGastroToken(user, tokenId, { from: owner });

            const actualTotal = await contract.getTotalTokensMinted();
            assert.equal(actualTotal.toString(), "1", "Total tokens minted is not correct");

            // Mint another token
            await contract.mintGastroToken(user, tokenId + 1, { from: owner });

            const newTotal = await contract.getTotalTokensMinted();
            assert.equal(newTotal.toString(), "2", "Total tokens minted is not updated correctly");
        });
    });


    describe('setCollectionName', () => {
        it('should allow owner to set collection name', async () => {
            const newName = "New Collection Name";
            await contract.setCollectionName(newName, { from: owner });

            const actualName = await contract.collectionName();
            assert.equal(actualName, newName, "Collection name was not updated");
        });

        it('should not allow non-owner to set collection name', async () => {
            const newName = "New Collection Name";
            try {
                await contract.setCollectionName(newName, { from: user });
                assert.fail("Expected error not encountered");
            } catch (error) {
                assert.isTrue(error.message.includes("You are not the owner"), "Unexpected error message");
            }
        });
    });

});
