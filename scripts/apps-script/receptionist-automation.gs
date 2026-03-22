/**
 * 24hr Receptionist — Google Apps Script Automation
 *
 * INSTALL INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Go to Extensions → Apps Script
 * 3. Paste the entire contents of this file
 * 4. Save the project (give it a name like "Receptionist Automation")
 * 5. Run setupTrigger() once to install the automatic trigger
 * 6. Grant permissions when prompted
 * 7. Done! The script will now fire on every sheet edit.
 *
 * To test: Run testRun() from the Apps Script editor.
 */

// =============================================================
// CONFIG — edit these values before deploying
// =============================================================
var CONFIG = {
  STATUS_COL:        8,   // Column H — Status
  NAME_COL:          2,   // Column B — Business Name
  CONTACT_COL:       3,   // Column C — Contact Name
  PHONE_COL:         4,   // Column D — Phone
  EMAIL_COL:         5,   // Column E — Email
  TIER_COL:          6,   // Column F — Tier
  CALL_COUNT_COL:    7,   // Column G — Call Count
  LAST_CALL_COL:     9,   // Column I — Last Call
  NOTES_COL:         10,  // Column J — Notes
  START_ROW:         2,   // First data row (row 1 is headers)
  WEBHOOK_URL:       '',  // Optional: POST to external webhook on new lead
  NOTIFICATION_EMAIL: Session.getActiveUser().getEmail()  // Who receives email alerts
};

// =============================================================
// MAIN TRIGGER FUNCTION
// =============================================================

/**
 * onEditReceptionist — Installable onEdit trigger handler.
 * Fires whenever a cell is edited in any sheet.
 *
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e - Edit event object
 */
function onEditReceptionist(e) {
  // Guard: no event object
  if (!e || !e.range) {
    Logger.log('onEditReceptionist: No event or range, skipping.');
    return;
  }

  var range = e.range;
  var row = range.getRow();

  // Guard: editing header rows
  if (row < CONFIG.START_ROW) {
    Logger.log('onEditReceptionist: Edit in header row ' + row + ', skipping.');
    return;
  }

  // Use getSheet() from range — never getSheetByName() so it works on any sheet tab
  var sheet = range.getSheet();

  // Read the entire row
  var lastCol = Math.max(CONFIG.NOTES_COL, 10);
  var rowValues = sheet.getRange(row, 1, 1, lastCol).getValues()[0];

  // Guard: empty row (name and email both missing)
  var businessName = rowValues[CONFIG.NAME_COL - 1] || '';
  var email = rowValues[CONFIG.EMAIL_COL - 1] || '';
  if (!businessName && !email) {
    Logger.log('onEditReceptionist: Row ' + row + ' appears empty, skipping.');
    return;
  }

  // Mark row as "Processed" in status column (only if not already processed)
  var currentStatus = rowValues[CONFIG.STATUS_COL - 1] || '';
  if (currentStatus !== 'Processed') {
    sheet.getRange(row, CONFIG.STATUS_COL).setValue('Processed');
    Logger.log('onEditReceptionist: Marked row ' + row + ' as Processed.');

    // Build row data object for notifications
    var rowData = {
      row:          row,
      businessName: businessName,
      contact:      rowValues[CONFIG.CONTACT_COL - 1] || '',
      phone:        rowValues[CONFIG.PHONE_COL - 1] || '',
      email:        email,
      tier:         rowValues[CONFIG.TIER_COL - 1] || '',
      callCount:    rowValues[CONFIG.CALL_COUNT_COL - 1] || 0,
      status:       'Processed',
      lastCall:     rowValues[CONFIG.LAST_CALL_COL - 1] || '',
      notes:        rowValues[CONFIG.NOTES_COL - 1] || ''
    };

    sendNotification(rowData);

    // Optional: POST to external webhook
    if (CONFIG.WEBHOOK_URL) {
      try {
        UrlFetchApp.fetch(CONFIG.WEBHOOK_URL, {
          method: 'post',
          contentType: 'application/json',
          payload: JSON.stringify(rowData),
          muteHttpExceptions: true
        });
      } catch (err) {
        Logger.log('onEditReceptionist: Webhook failed: ' + err.toString());
      }
    }
  } else {
    Logger.log('onEditReceptionist: Row ' + row + ' already processed, skipping notification.');
  }
}

// =============================================================
// NOTIFICATION
// =============================================================

/**
 * sendNotification — Send email alert for a new or updated lead.
 *
 * @param {Object} rowData - Object with lead fields
 */
function sendNotification(rowData) {
  var subject = 'New Lead: ' + (rowData.businessName || rowData.email || 'Unknown');

  var body = [
    '=== NEW LEAD ALERT ===',
    '',
    'Business Name: ' + rowData.businessName,
    'Contact:       ' + rowData.contact,
    'Phone:         ' + rowData.phone,
    'Email:         ' + rowData.email,
    'Plan:          ' + rowData.tier,
    'Calls:         ' + rowData.callCount,
    'Last Call:     ' + rowData.lastCall,
    'Notes:         ' + rowData.notes,
    '',
    'Time:          ' + new Date().toLocaleString(),
    '',
    '=====================',
    'Sent by 24hr Receptionist Automation'
  ].join('\n');

  try {
    MailApp.sendEmail({
      to:      CONFIG.NOTIFICATION_EMAIL,
      subject: subject,
      body:    body
    });
    Logger.log('sendNotification: Email sent to ' + CONFIG.NOTIFICATION_EMAIL);
  } catch (err) {
    Logger.log('sendNotification: Email failed: ' + err.toString());
  }
}

// =============================================================
// TRIGGER MANAGEMENT
// =============================================================

/**
 * setupTrigger — Removes any existing onEdit triggers for this
 * script and installs a fresh installable onEdit trigger.
 *
 * Run this ONCE after deploying to enable automatic execution.
 */
function setupTrigger() {
  var triggers = ScriptApp.getProjectTriggers();

  // Delete all existing onEdit triggers for this function
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'onEditReceptionist') {
      ScriptApp.deleteTrigger(trigger);
      Logger.log('setupTrigger: Deleted existing trigger ' + trigger.getUniqueId());
    }
  });

  // Install a fresh installable onEdit trigger
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.newTrigger('onEditReceptionist')
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  Logger.log('setupTrigger: New onEdit trigger installed for spreadsheet: ' + ss.getName());
  Logger.log('setupTrigger: Notifications will be sent to: ' + CONFIG.NOTIFICATION_EMAIL);
}

// =============================================================
// TEST / DEBUG
// =============================================================

/**
 * testRun — Simulates an edit event on row 2 with mock data.
 * Use this from the Apps Script editor to verify everything works.
 */
function testRun() {
  Logger.log('testRun: Starting test...');

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0]; // Use first sheet

  // Write mock data to row 2
  var mockValues = [
    new Date().toISOString(),    // A: Timestamp
    'Test Plumbing Co.',         // B: Business Name
    'John Smith',                // C: Contact
    '+1 (555) 123-4567',         // D: Phone
    'john@testplumbing.com',     // E: Email
    'starter',                   // F: Tier
    '0',                         // G: Call Count
    '',                          // H: Status (blank — trigger will fill it)
    '',                          // I: Last Call
    'Test run via Apps Script'   // J: Notes
  ];
  sheet.getRange(2, 1, 1, mockValues.length).setValues([mockValues]);

  // Build a mock edit event pointing to cell B2 (business name)
  var mockEvent = {
    range: sheet.getRange(2, CONFIG.NAME_COL),
    value: 'Test Plumbing Co.',
    oldValue: ''
  };

  // Run the trigger
  onEditReceptionist(mockEvent);

  // Verify status was written
  var status = sheet.getRange(2, CONFIG.STATUS_COL).getValue();
  Logger.log('testRun: Status cell value = "' + status + '"');

  if (status === 'Processed') {
    Logger.log('testRun: ✅ SUCCESS — trigger fired and status updated correctly.');
  } else {
    Logger.log('testRun: ❌ FAILED — status was not updated.');
  }

  Logger.log('testRun: Complete. Check your email at ' + CONFIG.NOTIFICATION_EMAIL);
}
