const { ObjectId } = require("mongodb");
const connectDB = require("../db/connect");

exports.newApplication = async (req, res) => {
  const { companyName, jobTitle, jobUrl, applicationDate, source, status } =
    req.body;

    console.log({...req.body})

  try {
    const db = await connectDB();
    const applications = db.collection("applications");

    const result = await applications.insertOne({
        ...req.body
    })
    res.json({
        success: true,
        _id: result.insertedId
    })
  } catch (err) {
    res.status(500).res.json({ message: err.message });
  }
};
