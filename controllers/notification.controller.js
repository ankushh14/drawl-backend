import notificationModel from "../models/notification.model.js";
import workSpaceModel from "../models/workspace.mode.js";
import { NOTIFICATION, NOTIFICATION_TYPE } from "../utils/notification.docs.js";

const getNotifications = async (req, res) => {
  try {
    const { email = "" } = req.body;
    if (email === "") {
      return res.status(400).json({ message: "Bad Request", valid: false });
    }
    const notifications = await notificationModel.find({ email });
    return res.status(200).json({ data: notifications, valid: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", valid: false });
  }
};

const notificationResponsesHandler = async (req, res) => {
  try {
    const { notificationID = undefined, answer = undefined } = req.body;
    if (notificationID === undefined || answer === undefined) {
      return res.status(400).json({ message: "Bad Request", valid: false });
    }
    const notification = await notificationModel.findById(notificationID);
    const workspace = await workSpaceModel.findById(notification.workspaceID);
    if (notification.type === NOTIFICATION_TYPE.INVITE) {
      if (answer) {
        await workSpaceModel.findByIdAndUpdate(notification.workspaceID, {
          $push: { members: notification.email },
        });
        await notificationModel.deleteOne(notification._id);
        await new notificationModel({
          email: notification.from,
          from: notification.email,
          workspaceID: notification.workspaceID,
          type: NOTIFICATION_TYPE.ACCEPT,
          message:
            NOTIFICATION.ACCEPT +
            ` ${notification.email} and has joined the workspace ${workspace.name}`,
        }).save();
        return res
          .status(200)
          .json({ message: "Accepted response", valid: true });
      } else {
        await notificationModel.deleteOne(notification._id);
        await new notificationModel({
          email: notification.from,
          from: notification.email,
          workspaceID: notification.workspaceID,
          type: NOTIFICATION_TYPE.REJECT,
          message:
            NOTIFICATION.REJECT +
            ` ${notification.email} and has not joined the workspace ${workspace.name}`,
        }).save();
        return res
          .status(200)
          .json({ message: "Accepted response", valid: true });
      }
    }
    if (notification.type === NOTIFICATION_TYPE.REQUEST) {
      if (answer) {
        await workSpaceModel.findByIdAndUpdate(notification.workspaceID, {
          $push: { members: notification.from },
        });
        await notificationModel.deleteOne(notification._id);
        await new notificationModel({
          email: notification.from,
          from: notification.email,
          workspaceID: notification.workspaceID,
          type: NOTIFICATION_TYPE.ACCEPT,
          message: NOTIFICATION.JOINACCEPT + ` ${workspace.name}`,
        }).save();
        return res
          .status(200)
          .json({ message: "Accepted response", valid: true });
      } else {
        await notificationModel.deleteOne(notification._id);
        await new notificationModel({
          email: notification.from,
          from: notification.email,
          workspaceID: notification.workspaceID,
          type: NOTIFICATION_TYPE.REJECT,
          message:
            NOTIFICATION.JOINREJECT + ` ${workspace.name} has been declined`,
        }).save();
        return res
          .status(200)
          .json({ message: "Accepted response", valid: true });
      }
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", valid: false });
  }
};

const deleteOneNotification = async (req, res) => {
  try {
    const notificationID = req.body.notificationID;
    if (!notificationID) {
      return res.status(400).json({ message: "Bad request", valid: false });
    }
    await notificationModel.findByIdAndDelete(notificationID);
    return res.status(200).json({ message: "Delete succesful!", valid: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", valid: false });
  }
};

const clearNotifications = async (req, res) => {
  try {
    const { userEmail } = req.body;
    if (!userEmail) {
      return res.status(400).json({ message: "Bad request", valid: false });
    }
    await notificationModel.deleteMany({
      email: userEmail,
      type: { $nin: [NOTIFICATION_TYPE.INVITE, NOTIFICATION_TYPE.REQUEST] },
    });
    return res.status(200).json({ message: "Clear succesful!", valid: true });

  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", valid: false });
  }
};

export {
  notificationResponsesHandler,
  getNotifications,
  deleteOneNotification,
  clearNotifications
};
