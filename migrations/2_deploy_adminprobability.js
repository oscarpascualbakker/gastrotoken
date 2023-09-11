const AdminProbability = artifacts.require("AdminProbability");

module.exports = async function(deployer) {
  await deployer.deploy(AdminProbability);

  const AdminProbabilityContract = await AdminProbability.deployed();

  await AdminProbabilityContract.loadGroups();
  await AdminProbabilityContract.loadNFTs();
  await AdminProbabilityContract.loadPoolNames();
};
