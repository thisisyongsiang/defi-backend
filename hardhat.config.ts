import "@nomicfoundation/hardhat-toolbox";
import dotenv from 'dotenv'

dotenv.config()

module.exports = {
  defaultNetwork: 'sepolia',
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [`0x${process.env.METAMASK_PRIVATE_KEY}`]
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};

// export default config;