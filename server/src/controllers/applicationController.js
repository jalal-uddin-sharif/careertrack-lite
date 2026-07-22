const { ObjectId } = require("mongodb");
const connectDB = require("../db/connect");

const allowedStatuses = ["Saved", "Applied", "Assessment", "Interview", "Rejected", "Offer"];
const allowedSources = ["LinkedIn", "Bdjobs", "Indeed", "Wellfound", "Facebook", "Referral", "Other"];

exports.createApplication = async (req, res) => {
  const { companyName, jobTitle, jobUrl, applicationDate, source, status, notes } = req.body;

  if (!companyName || !jobTitle || !applicationDate) {
    return res.status(400).json({ message: "Company name, job title and application date are required" });
  }

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid application status" });
  }

  if (source && !allowedSources.includes(source)) {
    return res.status(400).json({ message: "Invalid application source" });
  }

  try {
    const db = await connectDB();
    const applications = db.collection("applications");
    const now = new Date();

    const application = {
      userId: req.user._id,
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      jobUrl: jobUrl ? jobUrl.trim() : "",
      applicationDate,
      source: source || "Other",
      status: status || "Saved",
      notes: notes ? notes.trim() : "",
      createdAt: now,
      updatedAt: now
    };

    const result = await applications.insertOne(application);

    res.status(201).json({
      ...application,
      _id: result.insertedId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const db = await connectDB();
    const applications = db.collection("applications");

    const result = await applications
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getApplicationById = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid application id" });
  }

  try {
    const db = await connectDB();
    const applications = db.collection("applications");

    const application = await applications.findOne({
      _id: new ObjectId(req.params.id),
      userId: req.user._id
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateApplication = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid application id" });
  }

  const { companyName, jobTitle, jobUrl, applicationDate, source, status, notes } = req.body;

  if (!companyName || !jobTitle || !applicationDate) {
    return res.status(400).json({ message: "Company name, job title and application date are required" });
  }

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid application status" });
  }

  if (source && !allowedSources.includes(source)) {
    return res.status(400).json({ message: "Invalid application source" });
  }

  try {
    const db = await connectDB();
    const applications = db.collection("applications");

    const updatedApplication = {
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      jobUrl: jobUrl ? jobUrl.trim() : "",
      applicationDate,
      source: source || "Other",
      status: status || "Saved",
      notes: notes ? notes.trim() : "",
      updatedAt: new Date()
    };

    const result = await applications.findOneAndUpdate(
      {
        _id: new ObjectId(req.params.id),
        userId: req.user._id
      },
      { $set: updatedApplication },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteApplication = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid application id" });
  }

  try {
    const db = await connectDB();
    const applications = db.collection("applications");

    const result = await applications.deleteOne({
      _id: new ObjectId(req.params.id),
      userId: req.user._id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
