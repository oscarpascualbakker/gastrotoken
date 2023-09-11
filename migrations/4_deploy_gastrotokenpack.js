const NFTGastroToken = artifacts.require("NFTGastroToken");
const AdminProbability = artifacts.require("AdminProbability");
const GastroTokenPack = artifacts.require("GastroTokenPack");

module.exports = async function(deployer) {
  const NFTGastroTokenContract = await NFTGastroToken.deployed();
  const AdminProbabilityContract = await AdminProbability.deployed();

  await deployer.deploy(GastroTokenPack, NFTGastroTokenContract.address, AdminProbabilityContract.address);

  const GastroTokenPackContract = await GastroTokenPack.deployed();

  await NFTGastroTokenContract.setGastroTokenPackAddress(GastroTokenPackContract.address);
};
