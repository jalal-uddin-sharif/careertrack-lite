const { MongoClient } = require("mongodb");
let db;
const connectDB = async () => {
  if (db) return db;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db("CareerTrack_Lite");
  console.log("Mongodb connected");
  return db;
};

module.exports = connectDB
