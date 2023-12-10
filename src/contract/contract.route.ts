import { Router, Request, Response, NextFunction } from 'express';
import { userModel } from '../schemas/user.schema';
import { projectModel, toProject } from '../schemas/project.schema';
import { ObjectId } from 'mongodb';

const router = Router();

router.post('/updates/:id',async(req:Request,res:Response,next:NextFunction)=>{
    console.log('this is the contract updates');
    const contractAddress=req.params.id;
    const status=req.body.status;
    const project=await projectModel.findOneAndUpdate({contractAddress},{$set:{status}},{new:true}).lean().then(toProject);
    if( project){
        const notifications={message:'',status:'UNREAD'};
     
         if(status==='UNFUNDED'){
            notifications.message=`Project: ${project.name} is UNFUNDED`;
        }
        else if(status==='FUNDED'){
            notifications.message=`Project: ${project.name} is FUNDED`;
        }
        await userModel.updateMany({projects:project.id},{$push:{notifications}}).exec();
        await userModel.updateMany({walletAddress:project.owners},{$push:{notifications}}).exec();
        return res.send({message:'ok'});
    }
    else{
        return res.status(500).send({message:'unable to find project'});
    }
})

router.get('/voteRequest/:id',async(req:Request,res:Response,next:NextFunction)=>{
    console.log('triggering a vote request');
    const contractAddress=req.params.id;
    const project=await projectModel.findOne({contractAddress}).lean().then(toProject);
    if( project){
        const notifications={message:`Voting to disperse funds to project team has begun for project: ${project.name}`,status:'UNREAD'};
        await userModel.updateMany({projects:project.id},{$push:{notifications}}).exec();
        return res.send({message:'ok'});
    }
    else{
        return res.status(500).send({message:'unable to find project'});
    }
})

router.post('/voteOutcome/:id',async(req:Request,res:Response,next:NextFunction)=>{
    console.log('relaying vote outcome');
    const contractAddress=req.params.id;
    const outcome=req.body.outcome;
    const project=await projectModel.findOne({contractAddress}).lean().then(toProject);
    if( project){
        const notifications={message:'',status:'UNREAD'};
        if(outcome==='PASSED'){
            notifications.message=`Voting to disperse funds has PASSED for project: ${project.name}`;            
        }
        else if(outcome==='FAILED'){
            notifications.message=`Voting to disperse funds has FAILED for project: ${project.name}`;
        }
        await userModel.updateMany({projects:project.id},{$push:{notifications}}).exec();
        await userModel.updateMany({walletAddress:project.owners},{$push:{notifications}}).exec();
        return res.send({message:'ok'});
    }
    else{
        return res.status(500).send({message:'unable to find project'});
    }
})
export const contract=router;