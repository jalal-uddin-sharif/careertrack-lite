const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const connectDB = require("../db/connect");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const db = await connectDB();
      const users = db.collection("users");
      req.user = await users.findOne({ _id: new ObjectId(decoded.id) }, { projection: { password: 0 } });

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "No token, not authorized" });
  }
};

module.exports = protect;
