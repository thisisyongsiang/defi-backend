import { Router, Request, Response, NextFunction } from "express";
import { ethers } from "hardhat";
import { Project, projectModel, toProject } from "../schemas/project.schema";
import { toUser, userModel } from "../schemas/user.schema";
import { initFunctionSubscription } from "../../scripts/functions/initFunctionSubscription";

const router = Router();

router.post(
  "/create/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const walletAddress = req.params.id;
    const projectDetails: Project = req.body.projectDetails;
    if (!projectDetails.owners || projectDetails.owners.length === 0) {
      return res
        .status(500)
        .send(`There must at least be 1 owner of this project`);
    }
    if (!projectDetails.owners?.find((owner) => owner === walletAddress)) {
      return res
        .status(500)
        .send(`You must be an owner of this project to create it`);
    }
    projectDetails.status = "UNSTARTED";
    const project: Project = (await projectModel
      .create(projectDetails)
      .then(toProject)) as Project;
    await userModel
      .findOneAndUpdate(
        { walletAddress },
        { $set: { walletAddress }, $push: { projects: project.id } },
        { upsert: true, new: true }
      )
      .lean()
      .then(toUser);
    return res.send(project);
  }
);

router.put(
  "/update/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const walletAddress = req.params.id;
    const projectDetails: Project = req.body.projectDetails;
    if (!projectDetails.id) {
      return res.status(500).send(`Project does not exist`);
    }
    if (projectDetails.owners && projectDetails.owners.length === 0) {
      return res
        .status(500)
        .send(`There must at least be 1 owner of this project`);
    }
    if (!projectDetails.owners?.find((owner) => owner === walletAddress)) {
      return res
        .status(500)
        .send(`You must be an owner of this project to create it`);
    }
    const project: Project = (await projectModel
      .findByIdAndUpdate(projectDetails.id, { $set: { ...projectDetails } })
      .lean()
      .then(toProject)) as Project;
    return res.send(project);
  }
);

router.post(
  "/deploy",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.userId;
      const projectId = req.body.projectId;
      const project: Project = (await projectModel
        .findById(projectId)
        .lean()
        .then(toProject)) as Project;
      if (!project) {
        return res
          .status(500)
          .json({ message: `Unable to find project with id: ${projectId}` });
      }
      if (!project.owners.find((owner) => owner === userId)) {
        return res.status(500).send({ message: `Unauthorised request` });
      }
      const automationRegistrarAddress =
        "0xb0E49c5D0d05cbc241d68c05BC5BA1d1B7B72976";
      const linkTokenAddress = "0x779877A7B0D9E8603169DdbD7836e478b4624789";
      const usdcTokenAddress = "0x6f14C02Fc1F78322cFd7d707aB90f18baD3B54f5";

      console.log((project.startDate.getTime())/1000);

      const DeFiCrowdFunding = await ethers.deployContract("DeFiCrowdFunding", [
        (project.startDate.getTime())/1000,
        (project.endDate.getTime())/1000,
        project.minInvestment,
        project.quorom,
        project.owners[0],
        usdcTokenAddress,
        linkTokenAddress,
        automationRegistrarAddress,
      ]);
      await DeFiCrowdFunding.waitForDeployment();

      console.log('deployment complete')

      project.status = 'DEPLOYED';
      project.contractAddress = DeFiCrowdFunding.target as string;
      initFunctionSubscription(project.contractAddress,'0.1');

      await projectModel
        .findByIdAndUpdate(project.id, { $set: { ...project } })
        .lean()
        .then(toProject)

      // Send response
      return res.status(200).json({
        message: "Contract deployed",
        contractAddress: DeFiCrowdFunding.target,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error deploying contract" });
    }
  }
);

router.get("/all", async (req: Request, res: Response, next: NextFunction) => {
  const projects = await projectModel
    .find()
    .lean()
    .then((docs) => docs.map(toProject));
  return res.send({ projects });
});

router.get(
  "/:projectId",
  async (req: Request, res: Response, next: NextFunction) => {
    const projectId = req.params.projectId;
    const project = await projectModel
      .findById(projectId)
      .lean()
      .then(toProject);
    return res.send({ project });
  }
);

router.get(
  "/invested/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const investorWalletAddress = req.params.id;
    const projects = await projectModel
      .find({ investors: investorWalletAddress })
      .lean()
      .then((docs) => docs.map(toProject));
    return res.send({ projects });
  }
);

router.get(
  "/owned/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const ownerWalletAddress = req.params.id;
    const projects = await projectModel
      .find({ owners: ownerWalletAddress })
      .lean()
      .then((docs) => docs.map(toProject));
    return res.send({ projects });
  }
);

export const project = router;
