const { isBlacklisted } = require("./blacklistToken");
const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

const authCheck = async (req, res, next) => {
  try {
    let token = req.cookies?.token ||
                req.headers.authorization?.split(" ")[1] ||
                req.headers["x-access-token"];

    if (!token) {
      return res.status(401).json({ status: false, message: "No token provided" });
    }

    if (isBlacklisted(token)) {
      return res.status(401).json({ status: false, message: "Token is invalid or expired" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate("role", "name");

    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    if (user.isBanned) {
      const io = req.app.get("io");
      const onlineUsers = req.app.get("onlineUsers");
      const socketId = onlineUsers.get(user._id.toString());
      if (socketId) {
        io.to(socketId).emit("banned", { message: "You have been banned by admin." });
      }

      return res.status(403).json({ status: false, message: "Your account has been banned. Please contact support." });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("AuthCheck Error:", error);
    return res.status(401).json({ status: false, message: "Invalid or expired token" });
  }
};

module.exports = authCheck;
