const crypto = require("crypto");
const connectDB = require("../db/connect");

const createScriptCode = (syncSecret) => `const SYNC_SECRET = "${syncSecret}";

const HEADERS = [
  "Date", "Company", "Role", "Job Link", "JD Keywords", "Match Score",
  "Verdict", "Applied", "Response", "Task Received", "Interview Attempted",
  "Rejected", "Offer", "On Follow-up", "Platform", "Resume Version Used",
  "Outreach Sent", "Follow-up Date", "Current Stage", "Red Flags",
  "Next Best Action", "Notes"
];

function doPost(event) {
  try {
    const body = JSON.parse(event.postData.contents);

    if (body.secret !== SYNC_SECRET) {
      return sendJson({ success: false, message: "Unauthorized request" });
    }

    const sheetFile = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = sheetFile.getSheetByName("CareerTrack")
      || sheetFile.insertSheet("CareerTrack");

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    const app = body.application;
    const row = [
      safe(app.applicationDate), safe(app.companyName), safe(app.jobTitle),
      safe(app.jobUrl), safe((app.jdKeywords || []).join(", ")),
      app.matchScore || 0, safe(app.verdict), yesNo(app.applied),
      safe(app.response), yesNo(app.taskReceived),
      yesNo(app.interviewAttempted), yesNo(app.rejected), yesNo(app.offer),
      yesNo(app.onFollowUp), safe(app.source), safe(app.resumeVersionUsed),
      yesNo(app.outreachSent), safe(app.followUpDate), safe(app.status),
      safe(app.redFlags), safe(app.nextBestAction), safe(app.notes)
    ];

    let existingRow = 0;
    if (app.jobUrl && sheet.getLastRow() > 1) {
      const links = sheet.getRange(2, 4, sheet.getLastRow() - 1, 1).getValues();
      const foundIndex = links.findIndex(item => String(item[0]) === String(app.jobUrl));
      if (foundIndex >= 0) {
        existingRow = foundIndex + 2;
      }
    }

    if (existingRow) {
      sheet.getRange(existingRow, 1, 1, HEADERS.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    return sendJson({ success: true });
  } catch (error) {
    return sendJson({ success: false, message: error.message });
  }
}

function safe(value) {
  const text = String(value || "");
  return /^[=+@-]/.test(text) ? "'" + text : text;
}

function yesNo(value) {
  return value ? "Yes" : "No";
}

function sendJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}`;

exports.getGoogleSheetSettings = async (req, res) => {
  try {
    const db = await connectDB();
    const settingsCollection = db.collection("user_settings");
    let settings = await settingsCollection.findOne({ userId: req.user._id });

    if (!settings?.googleSheet?.syncSecret) {
      const syncSecret = crypto.randomBytes(24).toString("hex");
      await settingsCollection.updateOne(
        { userId: req.user._id },
        {
          $set: {
            "googleSheet.syncSecret": syncSecret,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            userId: req.user._id,
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );
      settings = await settingsCollection.findOne({ userId: req.user._id });
    }

    res.json({
      webhookUrl: settings.googleSheet.webhookUrl || "",
      configured: Boolean(settings.googleSheet.webhookUrl),
      scriptCode: createScriptCode(settings.googleSheet.syncSecret),
    });
  } catch (error) {
    res.status(500).json({ message: "Could not load Google Sheet settings" });
  }
};

exports.saveGoogleSheetSettings = async (req, res) => {
  const webhookUrl = String(req.body.webhookUrl || "").trim();
  const validUrl = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(webhookUrl);

  if (!validUrl) {
    return res.status(400).json({ message: "Enter a valid Google Apps Script Web App URL ending in /exec" });
  }

  try {
    const db = await connectDB();
    const settingsCollection = db.collection("user_settings");
    const currentSettings = await settingsCollection.findOne({ userId: req.user._id });
    const syncSecret = currentSettings?.googleSheet?.syncSecret
      || crypto.randomBytes(24).toString("hex");

    await settingsCollection.updateOne(
      { userId: req.user._id },
      {
        $set: {
          googleSheet: {
            webhookUrl,
            syncSecret,
          },
          updatedAt: new Date(),
        },
        $setOnInsert: {
          userId: req.user._id,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    res.json({ message: "Google Sheet connection saved", configured: true });
  } catch (error) {
    res.status(500).json({ message: "Could not save Google Sheet settings" });
  }
};
