const syncApplicationToSheet = async (application) => {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  const syncSecret = process.env.GOOGLE_SHEET_SYNC_SECRET;

  if (!webhookUrl || !syncSecret) {
    return {
      synced: false,
      message: "Google Sheet sync is not configured",
    };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secret: syncSecret,
      application: {
        applicationDate: application.applicationDate,
        companyName: application.companyName,
        jobTitle: application.jobTitle,
        jobUrl: application.jobUrl,
        jdKeywords: application.jdKeywords,
        matchScore: application.matchScore,
        verdict: application.verdict,
        applied: application.applied,
        response: application.response,
        taskReceived: application.taskReceived,
        interviewAttempted: application.interviewAttempted,
        rejected: application.rejected,
        offer: application.offer,
        onFollowUp: application.onFollowUp,
        source: application.source,
        resumeVersionUsed: application.resumeVersionUsed,
        outreachSent: application.outreachSent,
        followUpDate: application.followUpDate,
        status: application.status,
        redFlags: application.redFlags,
        nextBestAction: application.nextBestAction,
        notes: application.notes,
      },
    }),
    signal: AbortSignal.timeout(15000),
  });

  const responseText = await response.text();
  let result;

  try {
    result = JSON.parse(responseText);
  } catch {
    throw new Error("Google Sheet returned an invalid response");
  }

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Google Sheet sync failed");
  }

  return {
    synced: true,
    message: "Application added to Google Sheet",
  };
};

module.exports = syncApplicationToSheet;
