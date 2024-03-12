import { Router } from "express";
import {
  clearNotifications,
  deleteOneNotification,
  getNotifications,
  notificationResponsesHandler,
} from "../controllers/notification.controller.js";
import { validateUser } from "../middlewares/user.validate.js";

const notificationRouter = Router();

notificationRouter.post("/get", validateUser, getNotifications);
notificationRouter.post(
  "/response",
  validateUser,
  notificationResponsesHandler
);
notificationRouter.post("/deleteone", validateUser, deleteOneNotification);
notificationRouter.post("/clearall", validateUser, clearNotifications);

export default notificationRouter;
