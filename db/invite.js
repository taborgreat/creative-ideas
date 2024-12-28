const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const InviteSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, default: uuidv4 },
    userInviting: { type: String, ref: "User", required: true }, // User who sends the invite
    userReceiving: { type: String, ref: "User", required: true }, // User who receives the invite
    isToBeOwner: { type: Boolean, default: false }, // If the invite is for ownership or contributor
    isUninviting: { type: Boolean, default: false }, // If this is an uninvite action
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"], // Status of the invite
      default: "pending",
    },
    rootId: { type: String, ref: "Node", required: true }, // Associated root node
  },
);


const Invite = mongoose.model("Invite", InviteSchema);

module.exports = Invite;
