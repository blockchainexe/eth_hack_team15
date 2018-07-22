var HDWalletProvider = require("truffle-hdwallet-provider");
require('dotenv').config();
var mnemonic = process.env.RINKEBY_MNEMONIC;
var accessToken = process.env.INFURA_ACCESS_TOKEN;

module.exports = {
  networks: {
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(
          mnemonic,
          "https://rinkeby.infura.io/" + accessToken
        );
      },
      network_id: 3,
      gasPrice: web3.toWei(20, 'GWei'),
      gas: 3000000
    }   
  }
};
