const bcrypt = require("bcryptjs");
const connectDB = require("../db/connect");
const generateToken = require("../utils/generateToken");

exports.registerUser = async (req, res) => {
  const {  email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const userEmail = email.trim().toLowerCase();

  try {
    const db = await connectDB();
    const users = db.collection("users");

    const userExists = await users.findOne({ email: userEmail });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await users.insertOne({
      email: userEmail,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({
      _id: result.insertedId,
      email: userEmail,
      token: generateToken(result.insertedId)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  res.json({
    _id: req.user._id,
    email: req.user.email
  });
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const db = await connectDB();
    const users = db.collection("users");

    const user = await users.findOne({ email: email.trim().toLowerCase() });
    if (user && await bcrypt.compare(password, user.password)) {
      res.json({
        _id: user._id,
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
