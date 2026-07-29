const HEADERS = [
  "Date",
  "Company",
  "Role",
  "Job Link",
  "JD Keywords",
  "Match Score",
  "Verdict",
  "Applied",
  "Response",
  "Task Received",
  "Interview Attempted",
  "Rejected",
  "Offer",
  "On Follow-up",
  "Platform",
  "Resume Version Used",
  "Outreach Sent",
  "Follow-up Date",
  "Current Stage",
  "Red Flags",
  "Next Best Action",
  "Notes",
];

function doPost(event) {
  try {
    const settings = PropertiesService.getScriptProperties();
    const spreadsheetId = settings.getProperty("SPREADSHEET_ID");
    const expectedSecret = settings.getProperty("SYNC_SECRET");
    const body = JSON.parse(event.postData.contents);

    if (!expectedSecret || body.secret !== expectedSecret) {
      return jsonResponse({ success: false, message: "Unauthorized request" });
    }

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName("Applications") || spreadsheet.insertSheet("Applications");

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    const app = body.application;
    sheet.appendRow([
      safeCell(app.applicationDate),
      safeCell(app.companyName),
      safeCell(app.jobTitle),
      safeCell(app.jobUrl),
      safeCell((app.jdKeywords || []).join(", ")),
      app.matchScore || 0,
      safeCell(app.verdict),
      yesOrNo(app.applied),
      safeCell(app.response),
      yesOrNo(app.taskReceived),
      yesOrNo(app.interviewAttempted),
      yesOrNo(app.rejected),
      yesOrNo(app.offer),
      yesOrNo(app.onFollowUp),
      safeCell(app.source),
      safeCell(app.resumeVersionUsed),
      yesOrNo(app.outreachSent),
      safeCell(app.followUpDate),
      safeCell(app.status),
      safeCell(app.redFlags),
      safeCell(app.nextBestAction),
      safeCell(app.notes),
    ]);

    return jsonResponse({ success: true });
  } catch (error) {
    return jsonResponse({ success: false, message: error.message });
  }
}

function safeCell(value) {
  const text = String(value || "");
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function yesOrNo(value) {
  return value ? "Yes" : "No";
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
