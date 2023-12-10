import { Router, Request, Response, NextFunction } from "express";
import { User, toUser, userModel } from "../schemas/user.schema";
import { projectModel, toProject } from "../schemas/project.schema";
import { ObjectId } from "mongodb";

const router = Router();

router.get(
  "/notifications/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const walletAddress = req.params.id;
    const user = (await userModel
      .findOne({ walletAddress })
      .lean()
      .then(toUser)) as User;
    return res.send(user.notifications);
  }
);

router.get(
  "/unreadNotifications/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const walletAddress = req.params.id;
    const user = await userModel.findOne({ walletAddress }).lean().then(toUser);
    const unread = (user as User)?.notifications?.filter(
      (notification) => notification.status === "UNREAD"
    );
    return res.send(unread);
  }
);

router.post(
  "/notification/markAsRead/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const walletAddress = req.params.id;
    const notificationId = req.body.notificationId;

    const notification = await userModel
      .findOneAndUpdate(
        { walletAddress, "notifications._id": new ObjectId(notificationId) },
        { $set: { "notifications.$.status": "READ" } },
        { new: true }
      )
      .lean();

    return res.send(notification);
  }
);

router.post(
  "/invest/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const walletAddress = req.params.id;
    const projectId = req.body.projectId;
    if (!projectId) {
      return res.status(500).send({ message: "No projectId provided" });
    }
    const project = await projectModel
      .findByIdAndUpdate(
        projectId,
        { $push: { investors: walletAddress } },
        { new: true }
      )
      .lean()
      .then(toProject);
    if (!project) {
      return res
        .status(400)
        .send({ message: `unable to find project ${projectId}` });
    }
    await userModel
      .findOneAndUpdate(
        { walletAddress },
        { $set: { walletAddress }, $push: { projects: projectId } },
        { upsert: true }
      )
      .exec();
    const notificationToOwner = {
      message: `New Investment to project "${project.name}"`,
      status: "UNREAD",
    };
    await userModel
      .updateMany(
        { walletAddress: { $in: project.owners } },
        { $push: { notifications: notificationToOwner } }
      )
      .exec();
    return res.send(project);
  }
);

export const user = router;
