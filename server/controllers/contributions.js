const Contribution = require("../db/models/contribution");

//log contribution is in db/utils

const getContributions = async (req, res) => {
  const { nodeId } = req.body;

  try {
    const contributions = await Contribution.find({ nodeId })
      .populate("userId", "username")
      .populate("nodeId")
      .populate("inviteAction.receivingId", "username")
      .sort({ date: -1 });

    const enhancedContributions = contributions.map((contribution) => {
      let additionalInfo = null;

      switch (contribution.action) {
        case "editValue":
          additionalInfo = { valueEdited: contribution.valueEdited };
          break;
        case "editStatus":
          additionalInfo = { statusEdited: contribution.statusEdited };
          break;
        case "trade":
          additionalInfo = { tradeId: contribution.tradeId };
          break;
        case "invite":
          additionalInfo = {
            inviteAction: contribution.inviteAction
              ? {
                  action: contribution.inviteAction.action,
                  receivingUsername: contribution.inviteAction.receivingId
                    ? contribution.inviteAction.receivingId.username
                    : null,
                }
              : null,
          };
          break;
        case "editSchedule":
          additionalInfo = { scheduleEdited: contribution.scheduleEdited };
          break;
        case "editGoal":
          additionalInfo = { goalEdited: contribution.goalEdited };
          break;
        default:
          additionalInfo = null;
      }

      return {
        ...contribution.toObject(),
        username: contribution.userId.username,
        additionalInfo,
        nodeVersion: contribution.nodeVersion,
      };
    });

    res
      .status(200)
      .json({ success: true, contributions: enhancedContributions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports = {
  getContributions,
};
