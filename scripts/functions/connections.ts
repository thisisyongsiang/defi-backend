import {config}from 'dotenv';
config();
import {providers, Wallet} from 'ethers5';

export const provider = new providers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`);
export const wallet = new Wallet(process.env.METAMASK_PRIVATE_KEY || "UNSET");
export const signer = wallet.connect(provider);
