const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const connectDB = require("../db/connect");
const generateToken = require("../utils/generateToken");

exports.registerUser = async (req, res) => {
  const {  email, password } = req.body;
  console.log({...req.body});
  try {
    const db = await connectDB();
    const users = db.collection("users");

    const userExists = await users.findOne({ email });
    // console.log(userExists);
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await users.insertOne({
      email,
      password: hashedPassword
    });

    res.json({
      _id: result.insertedId,
      email,
      token: generateToken(result.insertedId)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const db = await connectDB();
    const users = db.collection("users");

    const user = await users.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
