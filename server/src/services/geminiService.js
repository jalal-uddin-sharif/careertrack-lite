const analysisSchema = {
  type: "OBJECT",
  properties: {
    companyName: {
      type: "STRING",
      description: "Company name stated in the job description. Empty string when unknown.",
    },
    jobTitle: {
      type: "STRING",
      description: "Job title stated in the job description. Empty string when unknown.",
    },
    jdKeywords: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Important skills, tools, experience and role keywords found in the JD.",
    },
    matchScore: {
      type: "INTEGER",
      description: "Evidence-based candidate match score from 0 to 100.",
    },
    verdict: {
      type: "STRING",
      enum: ["Strong Apply", "Apply After Minor Tweaks", "Stretch Apply", "Low ROI / Skip"],
    },
    redFlags: {
      type: "STRING",
      description: "Concise evidence-based risks or an empty string when none are clear.",
    },
    nextBestAction: {
      type: "STRING",
      description: "One practical next action based on the candidate gaps and role.",
    },
    analysisSummary: {
      type: "STRING",
      description: "Short explanation of the score using only supplied evidence.",
    },
  },
  required: [
    "companyName",
    "jobTitle",
    "jdKeywords",
    "matchScore",
    "verdict",
    "redFlags",
    "nextBestAction",
    "analysisSummary",
  ],
};

const analyzeJobWithGemini = async ({ jobUrl, jobDescription, profile }) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini is not configured. Add GEMINI_API_KEY to the server environment.");
  }

  const candidateProfile = {
    targetJobTypes: profile.targetJobTypes || [],
    experienceLevel: profile.experienceLevel || "",
    currentStatus: profile.currentStatus || "",
    resumeSummary: profile.resumeSummary || "",
    keySkills: profile.keySkills || [],
    weaknesses: profile.weaknesses || [],
    workPreference: profile.workPreference || "",
  };

  const prompt = `
You are an evidence-based job application analyst.

Compare the candidate profile with the pasted job description and return the requested JSON.

Rules:
- Use only facts in the candidate profile and job description.
- Never invent company details, candidate experience, skills, achievements, salary, or requirements.
- Treat a candidate skill as matched only when the profile provides evidence for it.
- Missing evidence is a gap, not a match.
- Score 85-100 = Strong Apply.
- Score 70-84 = Apply After Minor Tweaks.
- Score 40-69 = Stretch Apply.
- Score 0-39 = Low ROI / Skip.
- Keep red flags and next action concise.
- The job URL is context only. Do not claim its page was opened.

Job URL:
${jobUrl}

Candidate profile:
${JSON.stringify(candidateProfile)}

Job description:
${jobDescription}
`;

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: analysisSchema,
        },
      }),
      signal: AbortSignal.timeout(45000),
    }
  );

  const responseData = await response.json();

  if (!response.ok) {
    const apiMessage = responseData.error?.message || "Gemini request failed";
    throw new Error(apiMessage);
  }

  const responseText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!responseText) {
    throw new Error("Gemini returned an empty analysis");
  }

  return JSON.parse(responseText);
};

module.exports = analyzeJobWithGemini;
