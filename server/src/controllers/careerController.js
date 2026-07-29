const connectDB = require("../db/connect");

const techKeywords = [
  "javascript", "typescript", "react", "next.js", "node.js", "express",
  "mongodb", "postgresql", "sql", "rest api", "html", "css", "tailwind",
  "git", "github", "vite", "redux", "jwt", "authentication", "docker",
  "aws", "jest", "cypress", "responsive design",
];

const cleanList = (items = []) => {
  return items.map((item) => String(item).trim()).filter(Boolean);
};

const getProfile = async (req, res) => {
  try {
    const db = await connectDB();
    const profile = await db.collection("career_profiles").findOne({ userId: req.user._id });
    res.json(profile || null);
  } catch (error) {
    res.status(500).json({ message: "Could not load career profile" });
  }
};

const saveProfile = async (req, res) => {
  const profile = {
    fullName: String(req.body.fullName || "").trim(),
    phone: String(req.body.phone || "").trim(),
    location: String(req.body.location || "").trim(),
    targetJobTypes: cleanList(req.body.targetJobTypes),
    workPreference: String(req.body.workPreference || "").trim(),
    salaryPreference: String(req.body.salaryPreference || "").trim(),
    experienceLevel: String(req.body.experienceLevel || "").trim(),
    currentStatus: String(req.body.currentStatus || "").trim(),
    resumeSummary: String(req.body.resumeSummary || "").trim(),
    keySkills: cleanList(req.body.keySkills),
    linkedin: String(req.body.linkedin || "").trim(),
    github: String(req.body.github || "").trim(),
    portfolio: String(req.body.portfolio || "").trim(),
    availability: String(req.body.availability || "").trim(),
    weaknesses: cleanList(req.body.weaknesses),
    updatedAt: new Date(),
  };

  if (!profile.fullName || !profile.experienceLevel || profile.targetJobTypes.length === 0) {
    return res.status(400).json({
      message: "Full name, experience level and at least one target role are required",
    });
  }

  try {
    const db = await connectDB();
    await db.collection("career_profiles").updateOne(
      { userId: req.user._id },
      { $set: profile, $setOnInsert: { userId: req.user._id, createdAt: new Date() } },
      { upsert: true }
    );
    const savedProfile = await db.collection("career_profiles").findOne({ userId: req.user._id });
    res.json(savedProfile);
  } catch (error) {
    res.status(500).json({ message: "Could not save career profile" });
  }
};

const scanJobDescription = async (req, res) => {
  const company = String(req.body.company || "").trim();
  const role = String(req.body.role || "").trim();
  const jobDescription = String(req.body.jobDescription || "").trim();

  if (!company || !role || !jobDescription) {
    return res.status(400).json({ message: "Company, role and job description are required" });
  }

  try {
    const db = await connectDB();
    const profile = await db.collection("career_profiles").findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(400).json({ message: "Please save your student profile before scanning a job" });
    }

    const jdText = jobDescription.toLowerCase();
    const profileText = `${profile.keySkills.join(" ")} ${profile.resumeSummary}`.toLowerCase();
    const requiredSkills = techKeywords.filter((skill) => jdText.includes(skill));
    const matchedSkills = requiredSkills.filter((skill) => profileText.includes(skill));
    const missingSkills = requiredSkills.filter((skill) => !profileText.includes(skill));

    const skillScore = requiredSkills.length
      ? Math.round((matchedSkills.length / requiredSkills.length) * 70)
      : 35;
    const profileScore = [
      profile.resumeSummary, profile.github, profile.linkedin, profile.portfolio,
    ].filter(Boolean).length * 4;
    const seniorRole = /\b(senior|lead|manager|[3-9]\+?\s*years)\b/i.test(jobDescription);
    const juniorProfile = /fresher|entry|junior|student/i.test(profile.experienceLevel);
    const levelScore = seniorRole && juniorProfile ? 3 : 14;
    const score = Math.min(100, skillScore + profileScore + levelScore);

    let verdict = "Low ROI / Skip";
    if (score >= 85) verdict = "Strong Apply";
    else if (score >= 70) verdict = "Apply After Minor Tweaks";
    else if (score >= 40) verdict = "Stretch Apply";

    const confidence = requiredSkills.length >= 3 ? "High" : "Medium";
    const result = {
      roleSnapshot: {
        company,
        role,
        detectedRequirements: requiredSkills,
        confidence,
      },
      estimatedMatchScore: score,
      verdict,
      whyThisScore: [
        `${matchedSkills.length} of ${requiredSkills.length || "the detected"} technical requirements match your profile.`,
        seniorRole && juniorProfile
          ? "The description appears to ask for more experience than your current level."
          : "Your stated experience level is not in clear conflict with the description.",
        profile.resumeSummary
          ? "A resume summary was available for evidence."
          : "No resume summary was available, so the result is less complete.",
      ],
      gapAnalysis: {
        matchedSkills,
        missingSkills,
        unknowns: requiredSkills.length
          ? []
          : ["No common technical keywords were detected. Review the description manually."],
      },
      resumeTargetingAdvice: {
        headline: `Target your resume toward ${role}`,
        skillsToHighlight: matchedSkills,
        improvements: missingSkills.length
          ? missingSkills.map((skill) => `Add ${skill} only if you can prove it with a project or experience.`)
          : ["Use measurable results and examples for your strongest matched skills."],
      },
      applyStrategy: verdict === "Low ROI / Skip"
        ? "Prioritize closer-fit roles unless this opportunity is especially important."
        : "Tailor the resume, verify every claim, then apply with a short role-specific note.",
      redFlags: seniorRole && juniorProfile
        ? ["Possible seniority mismatch."]
        : ["No clear red flag was detected from the provided text."],
      finalActionRecommendation: verdict,
    };

    await db.collection("jd_scans").insertOne({
      userId: req.user._id,
      company,
      role,
      jobDescription,
      result,
      createdAt: new Date(),
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Could not scan this job description" });
  }
};

const getGoals = async (req, res) => {
  try {
    const db = await connectDB();
    const data = await db.collection("weekly_goals").findOne({ userId: req.user._id });
    res.json(data ? data.goals : []);
  } catch (error) {
    res.status(500).json({ message: "Could not load weekly goals" });
  }
};

const saveGoals = async (req, res) => {
  if (!Array.isArray(req.body.goals) || req.body.goals.length > 3) {
    return res.status(400).json({ message: "You can save a maximum of three weekly goals" });
  }

  const goals = req.body.goals.map((goal) => ({
    statement: String(goal.statement || "").trim(),
    targetNumber: Math.max(0, Number(goal.targetNumber) || 0),
    progress: Math.max(0, Number(goal.progress) || 0),
    blockers: String(goal.blockers || "").trim(),
    status: ["Not started", "In progress", "Completed"].includes(goal.status)
      ? goal.status
      : "Not started",
  })).filter((goal) => goal.statement);

  try {
    const db = await connectDB();
    await db.collection("weekly_goals").updateOne(
      { userId: req.user._id },
      { $set: { goals, updatedAt: new Date() }, $setOnInsert: { userId: req.user._id } },
      { upsert: true }
    );
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: "Could not save weekly goals" });
  }
};

module.exports = {
  getProfile,
  saveProfile,
  scanJobDescription,
  getGoals,
  saveGoals,
};
