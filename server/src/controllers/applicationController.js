const { ObjectId } = require("mongodb");
const connectDB = require("../db/connect");
const analyzeJobWithGemini = require("../services/geminiService");
const syncApplicationToSheet = require("../services/googleSheetService");

const allowedStatuses = ["Saved", "Applied", "Assessment", "Interview", "Rejected", "Offer"];
const allowedSources = ["LinkedIn", "Bdjobs", "Indeed", "Wellfound", "Facebook", "Referral", "Other"];
const allowedVerdicts = ["Not checked", "Strong Apply", "Apply After Minor Tweaks", "Stretch Apply", "Low ROI / Skip"];

const textValue = (value) => String(value || "").trim();
const booleanValue = (value) => value === true || value === "true";

const buildApplication = (body) => ({
  companyName: textValue(body.companyName),
  jobTitle: textValue(body.jobTitle),
  jobUrl: textValue(body.jobUrl),
  jobDescription: textValue(body.jobDescription),
  applicationDate: body.applicationDate,
  jdKeywords: Array.isArray(body.jdKeywords) ? body.jdKeywords.map(textValue).filter(Boolean) : [],
  matchScore: Math.min(100, Math.max(0, Number(body.matchScore) || 0)),
  verdict: allowedVerdicts.includes(body.verdict) ? body.verdict : "Not checked",
  applied: booleanValue(body.applied),
  response: textValue(body.response),
  taskReceived: booleanValue(body.taskReceived),
  interviewAttempted: booleanValue(body.interviewAttempted),
  rejected: booleanValue(body.rejected),
  offer: booleanValue(body.offer),
  onFollowUp: booleanValue(body.onFollowUp),
  source: body.source || "Other",
  resumeVersionUsed: textValue(body.resumeVersionUsed),
  outreachSent: booleanValue(body.outreachSent),
  followUpDate: body.followUpDate || "",
  status: body.status || "Saved",
  redFlags: textValue(body.redFlags),
  nextBestAction: textValue(body.nextBestAction),
  notes: textValue(body.notes),
});

exports.createApplication = async (req, res) => {
  const { companyName, jobTitle, applicationDate, source, status } = req.body;

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
      ...buildApplication(req.body),
      createdAt: now,
      updatedAt: now
    };

    const result = await applications.insertOne(application);
    let sheetSync;

    try {
      const sheetSettings = await db.collection("user_settings").findOne({
        userId: req.user._id,
      });
      sheetSync = await syncApplicationToSheet(application, sheetSettings?.googleSheet);
    } catch (sheetError) {
      console.error("Google Sheet sync failed:", sheetError.message);
      sheetSync = {
        synced: false,
        message: sheetError.message,
      };
    }

    res.status(201).json({
      ...application,
      _id: result.insertedId,
      sheetSync,
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

  const { companyName, jobTitle, applicationDate, source, status } = req.body;

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
      ...buildApplication(req.body),
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

exports.analyzeApplication = async (req, res) => {
  const jobUrl = textValue(req.body.jobUrl);
  const jobDescription = textValue(req.body.jobDescription);

  if (!jobUrl || !jobDescription) {
    return res.status(400).json({ message: "Job URL and job description are required" });
  }

  try {
    const db = await connectDB();
    const profile = await db.collection("career_profiles").findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(400).json({ message: "Save your Career Assistant profile first" });
    }

    let source = "Other";
    const url = jobUrl.toLowerCase();
    if (url.includes("linkedin")) source = "LinkedIn";
    else if (url.includes("bdjobs")) source = "Bdjobs";
    else if (url.includes("indeed")) source = "Indeed";
    else if (url.includes("wellfound")) source = "Wellfound";
    else if (url.includes("facebook")) source = "Facebook";

    const analysis = await analyzeJobWithGemini({
      jobUrl,
      jobDescription,
      profile,
    });

    res.json({
      companyName: textValue(analysis.companyName),
      jobTitle: textValue(analysis.jobTitle),
      jdKeywords: Array.isArray(analysis.jdKeywords)
        ? analysis.jdKeywords.map(textValue).filter(Boolean).slice(0, 25)
        : [],
      matchScore: Math.min(100, Math.max(0, Number(analysis.matchScore) || 0)),
      verdict: allowedVerdicts.includes(analysis.verdict) ? analysis.verdict : "Not checked",
      source,
      redFlags: textValue(analysis.redFlags),
      nextBestAction: textValue(analysis.nextBestAction),
      analysisSummary: textValue(analysis.analysisSummary),
    });
  } catch (error) {
    console.error("Gemini analysis failed:", error.message);
    res.status(500).json({ message: error.message || "Could not analyze this job description" });
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

exports.getDashboardStats = async (req, res) => {
  try {
    const db = await connectDB();
    const applications = db.collection("applications");

    const userApplications = await applications
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .toArray();

    const stats = {
      total: userApplications.length,
      saved: 0,
      applied: 0,
      assessment: 0,
      interview: 0,
      rejected: 0,
      offer: 0
    };

    userApplications.forEach((application) => {
      if (!application.status) {
        return;
      }

      const statusKey = application.status.toLowerCase();

      if (stats[statusKey] !== undefined) {
        stats[statusKey] += 1;
      }
    });

    res.json({
      stats,
      recentApplications: userApplications.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
