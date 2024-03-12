const NOTIFICATION = Object.freeze({
    INVITE : "You are invited to join a workspace",
    ACCEPT : "Your invitation has been accepted by",
    REJECT : "Your invitation was rejected by",
    REQUEST : "requested to join your workspace",
    REMOVE : "You have been removed from the workspace",
    JOINACCEPT : "You have been added to the workspace",
    JOINREJECT : "Your request to join the workspace",
    LEAVE : "left your workspace"
})

const NOTIFICATION_TYPE = Object.freeze({
    INVITE : "INVITE",
    REQUEST : "REQUEST",
    REMOVE:"REMOVE",
    ACCEPT:"ACCEPT",
    REJECT:"REJECT",
    LEAVE:"LEAVE"
})

export { NOTIFICATION,NOTIFICATION_TYPE }