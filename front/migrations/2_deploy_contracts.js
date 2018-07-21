var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var Token = artifacts.require("./Token.sol")

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  const initialSupply = 50000e18;
  deployer.deploy(Token, initialSupply);
};
