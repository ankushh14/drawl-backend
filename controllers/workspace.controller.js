import workSpaceModel from "../models/workspace.mode.js";
import userModel from "../models/user.model.js";
import { NOTIFICATION, NOTIFICATION_TYPE } from "../utils/notification.docs.js";
import notificationModel from "../models/notification.model.js";

const createWorkspace = async (req, res) => {
  try {
    const { name, description, members = [], password = "", owner } = req.body;
    const workspace = await new workSpaceModel({
      name,
      description,
      password,
      owner,
    }).save();
    if (members.length == 0) {
      return res
        .status(200)
        .json({ message: "Workspace created!", valid: true });
    }
    members.map(async (item) => {
      await notificationModel({
        email: item,
        message: `${NOTIFICATION.INVITE} ${name} by ${owner}`,
        type: NOTIFICATION_TYPE.INVITE,
        from: owner,
        workspaceID: workspace._id,
      }).save();
    });
    return res.status(200).json({ message: "Workspace created!", valid: true });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "All mandatory fields must be filled!", valid: false });
  }
};

const addMembers = async (req, res) => {
  const { members = [], workspaceID } = req.body;
  if (members.length === 0 || !workspaceID) {
    return res.status(400).json({ message: "Bad Request", valid: false });
  }
  try {
    const workspace = await workSpaceModel.findById(workspaceID);
    if (!workspace) {
      return res
        .status(400)
        .json({ message: "Bad Request", valid: false });
    }
    members.map(async (item) => {
      await notificationModel({
        email: item,
        message: `${NOTIFICATION.INVITE} ${workspace.name} by ${workspace.owner}`,
        type: NOTIFICATION_TYPE.INVITE,
        from: workspace.owner,
        workspaceID: workspaceID,
      }).save();
    });

    return res.status(200).json({ message: "Invite sent!", valid: true });

  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", valid: false });
  }
};

const updateWorkspacePassword = async (req, res) => {
  const { password, workspaceID } = req.body;
  if (!workspaceID) {
    return res.status(400).json({ message: "Bad Request", valid: false });
  }
  try {
    await workSpaceModel.findByIdAndUpdate(workspaceID, {
      $set: { password: password },
    });
    return res.status(200).json({ message: "Password updated!", valid: true });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", valid: false });
  }
};

const findMembers = async (req, res) => {
  try {
    const { email } = req.body;
    const users = await userModel.find({
      email: { $regex: email, $options: "i" },
    });
    const dataToSend = await users.map((item) => {
      return {
        email: item.email,
        profile: item.profile,
      };
    });
    return res.status(200).send({ data: dataToSend, valid: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", valid: false });
  }
};

const getWorkspaces = async (req, res) => {
  try {
    const { owner, forProfile = false } = req.body;
    const workspacesFromOtherOwners = await workSpaceModel.find({
      members: owner,
    });
    const mongoResponse = await workSpaceModel.find({ owner });
    const data = await mongoResponse.map((item) => {
      return {
        name: item.name,
        description: item.description,
        password: item.password,
        ID: item._id,
        members: item.members,
        owner: item.owner,
      };
    });
    if (forProfile) {
      return res.status(200).json({ data: data, valid: true });
    }
    const workspacesOthers = await workspacesFromOtherOwners.map((item) => {
      return {
        name: item.name,
        description: item.description,
        password: item.password,
        ID: item._id,
        members: item.members,
        owner: item.owner,
      };
    });
    const workspaces = [...data, ...workspacesOthers];
    return res.status(200).json({ data: workspaces, valid: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", valid: false });
  }
};

const getSpecificWorkspace = async (req, res) => {
  try {
    const { id } = req.body;
    const workspace = await workSpaceModel.findById(id.id);
    const dataToSend = {
      name: workspace.name,
      description: workspace.description,
      password: workspace.password,
      ID: workspace._id,
      members: workspace.members,
      owner: workspace.owner,
    };
    return res.status(200).json({ data: dataToSend, valid: true });
  } catch (error) {
    return res.status(500).json({
      message: "Workspace, you just tried to visit was not found",
      valid: false,
    });
  }
};

const getWorkspaceMemberProfiles = async (req, res) => {
  try {
    const { workspaceID } = req.body;
    const workspace = await workSpaceModel.findById(workspaceID);
    const memberArr = workspace.members;
    let profileArray = [];
    const owner = workspace.owner;
    const ownerProfile = await userModel.findOne({ email: owner });
    if (memberArr.length > 0) {
      profileArray = await Promise.all(
        memberArr.map(async (item) => {
          const profile = await userModel.findOne({ email: item });
          return profile.profile;
        })
      );
    }
    const dataToSend = [...profileArray, ownerProfile.profile];
    return res.status(200).json({ data: dataToSend, valid: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error" + error.message, valid: false });
  }
};

const findWorkspaces = async (req, res) => {
  try {
    const { name, email } = req.body;
    const workspaces = await workSpaceModel.find({
      name: { $regex: name },
      owner: { $ne: email, $exists: true },
      members: { $ne: email, $exists: true },
    });
    const dataToSend = await workspaces.map((item) => {
      return {
        name: item.name,
        members: item.members,
        owner: item.owner,
        ID: item._id,
      };
    });
    res.status(200).send({ data: dataToSend, valid: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", valid: false });
  }
};

const joinWorkspace = async (req, res) => {
  try {
    const { to, from, ID, workspacename } = req.body;
    await notificationModel({
      email: to,
      message: `${from} ${NOTIFICATION.REQUEST} - ${workspacename}`,
      type: NOTIFICATION_TYPE.REQUEST,
      from: from,
      workspaceID: ID,
    }).save();
    return res.status(200).json({ message: "Request sent!", valid: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", valid: false });
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    const { workspaceID } = req.body;
    const response = await workSpaceModel.findByIdAndDelete(workspaceID);
    if (response) {
      return res
        .status(200)
        .json({ message: "Deleted successfuly!", valid: true });
    } else {
      throw new Error("some error");
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Delete unsuccesful some error occured", valid: false });
  }
};

const removeMember = async (req, res) => {
  try {
    const { memberMail, workspaceID } = req.body;
    const response = await workSpaceModel.findByIdAndUpdate(workspaceID, {
      $pull: { members: memberMail },
    });
    if (response) {
      await new notificationModel({
        email: memberMail,
        from: response.owner,
        workspaceID,
        message: NOTIFICATION.REMOVE + ` ${response.name} by ${response.owner}`,
        type: NOTIFICATION_TYPE.REMOVE,
      }).save();
      return res
        .status(200)
        .json({ message: "Member removed successfuly!", valid: true });
    } else {
      throw new Error("some error");
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Unsuccesful, some error occured", valid: false });
  }
};

const leaveWorkspace = async (req, res) => {
  try {
    const { userEmail, workspaceID } = req.body;
    if (!userEmail || !workspaceID) {
      return res.status(400).json({ message: "Bad request", valid: false });
    }
    const response = await workSpaceModel.findByIdAndUpdate(workspaceID, {
      $pull: { members: userEmail },
    });
    if (response) {
      await new notificationModel({
        email: response.owner,
        from: userEmail,
        workspaceID,
        message: ` ${userEmail} ${NOTIFICATION.LEAVE} - ${response.name}`,
        type: NOTIFICATION_TYPE.LEAVE,
      }).save();
      return res
        .status(200)
        .json({ message: "Left successfuly!", valid: true });
    } else {
      throw new Error("some error");
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Unsuccesful, some error occured", valid: false });
  }
};

export {
  createWorkspace,
  findMembers,
  getWorkspaces,
  getSpecificWorkspace,
  getWorkspaceMemberProfiles,
  findWorkspaces,
  joinWorkspace,
  deleteWorkspace,
  removeMember,
  leaveWorkspace,
  updateWorkspacePassword,
  addMembers
};
