var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "candy maplecake sugar pudding cream honey rich smooth crumble sweet treat candy";

module.exports = {
  networks: {
    development: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:8545/", 0, 100);
      },
      network_id: '*',
      gas: 9999999,
      websockets: true
    },
    development_cli: {
        host: "127.0.0.1",
        port: 8545,
        network_id: "*",
        websockets: true
    },
  },
  compilers: {
    solc: {
      version: "0.4.25"
    }
  }
};