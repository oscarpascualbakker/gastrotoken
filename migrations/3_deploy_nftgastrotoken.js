const NFTGastroToken = artifacts.require("NFTGastroToken");

module.exports = async function(deployer) {
  await deployer.deploy(NFTGastroToken, "0x0000000000000000000000000000000000000000");
};
