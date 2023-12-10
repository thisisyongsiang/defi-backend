import express from 'express';
import { ethers } from 'hardhat';
import { contract } from './contract/contract.route';
import cors from 'cors';
import { user } from './user/user.route';
import { project } from './project/project.route';
import { initFunctionSubscription } from '../scripts/functions/initFunctionSubscription';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/deploy', async (req, res) => {
  try {
    const { startDate, endDate } = req.body.data;
    const automationRegistrarAddress = '0xb0E49c5D0d05cbc241d68c05BC5BA1d1B7B72976';
    const linkTokenAddress = '0x779877A7B0D9E8603169DdbD7836e478b4624789';
    const usdcTokenAddress = '0x6f14C02Fc1F78322cFd7d707aB90f18baD3B54f5';

    const DeFiCrowdFunding = await ethers.deployContract('DeFiCrowdFunding', [startDate, endDate, usdcTokenAddress, linkTokenAddress, automationRegistrarAddress])
    await DeFiCrowdFunding.waitForDeployment();
    initFunctionSubscription(DeFiCrowdFunding.target.toString(),'0.1');
    // Send response
    res.status(200).json({ message: 'Contract deployed', contractAddress: DeFiCrowdFunding.target });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deploying contract' });
  }
});
app.use('/contract',contract);
app.use('/user',user);
app.use('/project',project);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});