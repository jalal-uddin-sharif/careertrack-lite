const { MongoClient } = require("mongodb");
let db;
const connectDB = async () => {
  if (db) return db;
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db("CareerTrack_Lite");
  console.log("Mongodb connected");
  return db;
};

module.exports = connectDB
