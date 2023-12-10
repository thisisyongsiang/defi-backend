import { SubscriptionManager } from "@chainlink/functions-toolkit";
import {utils} from 'ethers5';
import { signer, wallet,  provider } from "./connections";
import { networks } from "./network";

const functionsRouterAddress = networks.ethereumSepolia.functionsRouter;
const linkTokenAddress = networks.ethereumSepolia.linkToken;

export const initFunctionSubscription=async(contractAddress:string,linkAmount:string)=>{
    console.log('chainlink function subscribing to contract')
    const subscriptionManager=new SubscriptionManager({
        signer,
        linkTokenAddress,
        functionsRouterAddress,
    });
    await subscriptionManager.initialize();

    const subscriptionId=await subscriptionManager.createSubscription();

    const receipt=await subscriptionManager.addConsumer({
        subscriptionId,
        consumerAddress:contractAddress,
    });

    const juelsAmount = utils.parseUnits(linkAmount,18).toString();
    subscriptionManager.fundSubscription({
        subscriptionId,
        juelsAmount
    });
    console.log('chainlink function subscribed to contract')
}