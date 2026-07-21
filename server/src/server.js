const express = require('express');
require("dotenv").config()
const dns = require("dns")
dns.setServers(["1.1.1.1", "8.8.8.8"])
const port = 3000;

const app = express();
app.use(express.json())

const connectDB = require("./db/connect")

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