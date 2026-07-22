const express = require('express');
require("dotenv").config()
const cors = require("cors");
const dns = require("dns");
const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}


const app = express();
app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    "https://careertracklite.vercel.app"
  ]
}));
app.use(express.json())

const connectDB = require("./db/connect")
const authRoutes = require("./routes/authRoutes")
const applicationRoutes = require ("./routes/applicationRoute")
app.use("/api/auth", authRoutes);

app.get('/', (req, res) => {
  res.send('api is running');
});

app.get('/api/health', (req, res) => {
  res.json({ status: "ok", message: "CareerTrack API is running" });
});

app.use("/api", applicationRoutes)

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log("Database connection failed", error.message);
    process.exit(1);
  }
};

startServer();
