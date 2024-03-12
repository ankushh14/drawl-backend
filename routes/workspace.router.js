import { Router } from "express";
import {
        addMembers,
        createWorkspace,
        deleteWorkspace,
        findMembers,
        findWorkspaces,
        getSpecificWorkspace,
        getWorkspaceMemberProfiles,
        getWorkspaces,
        joinWorkspace,
        leaveWorkspace,
        removeMember,
        updateWorkspacePassword
} from "../controllers/workspace.controller.js";
import { validateUser } from "../middlewares/user.validate.js";

const workspaceRouter = Router()

workspaceRouter.post("/create", validateUser, createWorkspace)
workspaceRouter.post("/members", validateUser, findMembers)
workspaceRouter.post("/updatepassword", validateUser, updateWorkspacePassword)
workspaceRouter.post("/findworkspaces", validateUser, findWorkspaces)
workspaceRouter.post("/getworkspaces", validateUser, getWorkspaces)
workspaceRouter.post("/getspecific", validateUser, getSpecificWorkspace)
workspaceRouter.post("/getprofiles", validateUser, getWorkspaceMemberProfiles)
workspaceRouter.post("/joinworkspace", validateUser, joinWorkspace)
workspaceRouter.post("/deleteworkspace", validateUser, deleteWorkspace)
workspaceRouter.post("/removemember", validateUser, removeMember)
workspaceRouter.post("/leave", validateUser, leaveWorkspace)
workspaceRouter.post("/addmembers", validateUser, addMembers)

export default workspaceRouter