const BlockedSchema = require("../../Models/Blocked.Models");
const users = require("../../Models/User.model");
class BlockedUsers {
  static blockUser = async (req, res) => {
    try {
      // User already Blocked Unblock him
      const user = await users.findOne({ _id: req.params.id});

      user.isBlocked = !user.isBlocked;

      user.save();
      res.send();
    } catch (error) {
      res.status(400).send({
        apiStatus: false,
        data: error.message,
        message: "error Blcoking User ",
      });
    }
  };
  static getALlBlockedUsers = async (req, res) => {
    try {
      const allusers = await users
        .find({ isBlocked: true })
        .select(["Name", "Number", "email", "userRole", "_id", "isBlocked"]);
      res.send(allusers);
    } catch (error) {
      res.status(400).send({
        apiStatus: false,
        data: error.message,
        message: "error SHOWING  Blcoking User ",
      });
    }
  };
}
module.exports = BlockedUsers;
