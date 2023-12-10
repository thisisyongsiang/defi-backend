import { ethers } from "hardhat";
import * as hardhat from 'hardhat';

async function main() {

  const DeFiCrowdFunding = await ethers.deployContract('DeFiCrowdFunding', [1670198400000, 1672876800000, '0x8267cF9254734C6Eb452a7bb9AAF97B392258b21'])
  await DeFiCrowdFunding.waitForDeployment();
  console.log(`Deployed to ${DeFiCrowdFunding.target}`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

export async function deployContract() {
  const DeFiCrowdFundingFactory = await hardhat.ethers.getContractFactory("DeFiCrowdFunding");
  const DeFiCrowdFunding = await DeFiCrowdFundingFactory.deploy(/* constructor arguments */);

  await DeFiCrowdFunding.deployed();

  console.log(`Deployed to ${DeFiCrowdFunding.address}`);

  return DeFiCrowdFunding.address;
}
