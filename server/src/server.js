const express = require('express');
require("dotenv").config()
const dns = require("dns")
dns.setServers(["1.1.1.1", "8.8.8.8"])
const port = 3000;
const cors = require("cors");


const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL
}));
app.use(express.json())

const connectDB = require("./db/connect")
const authRoutes = require("./routes/authRoutes")
const applicationRoutes = require ("./routes/applicationRoute")
app.use("/api/auth", authRoutes);
app.use("/api", applicationRoutes)

//mongodb connection test
connectDB().then(()=>{
  console.log("Mongodb connection success");
}).catch(err =>{
  console.log("mongodb connection fail", err);
})

app.get('/', (req, res) => {
  res.send('api is running');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});