/**
 * Mine Incident & Near Miss Reporting Portal - Google Apps Script Backend
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Click Extensions > Apps Script.
 * 3. Delete any default code in Code.gs and paste this script.
 * 4. Save the script (Ctrl+S).
 * 5. Click "Deploy" > "New deployment".
 * 6. Select "Web app" as the type.
 * 7. Set:
 *    - Description: Mine Incident Web App
 *    - Execute as: Me (your-email@gmail.com)
 *    - Who has access: Anyone (This is critical to allow submissions without log in).
 * 8. Click Deploy, authorize permissions, and copy the Web App URL.
 * 9. Paste this URL into the web portal settings.
 */

function doPost(e) {
  try {
    // 1. Parse incoming data
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No payload contents found in request.");
    }

    var data = JSON.parse(e.postData.contents);

    // 2. Open active sheet and check/create headers if empty
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();

    if (lastRow === 0) {
      // Write headers if sheet is brand new
      sheet.appendRow([
        "Timestamp",
        "Report Classification",
        "Reporter Name",
        "Mobile Number",
        "Date of Incident",
        "Time of Incident",
        "Vehicle Registration Number",
        "Location",
        "Injury Occurred?",
        "Injury & Injured Person Details",
        "Brief Description",
        "Photos (Google Drive Links)"
      ]);
      // Format headers: Bold and background color
      sheet.getRange(1, 1, 1, 12)
        .setFontWeight("bold")
        .setBackground("#f1f5f9")
        .setBorder(true, true, true, true, true, true, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID);
    }

    // 3. Process image file uploads into Google Drive folder
    var folderName = "Mine Incident Photos";
    var photoUrls = [];

    if (data.photos && data.photos.length > 0) {
      var folder;
      var folders = DriveApp.getFoldersByName(folderName);

      // Get existing folder or create new one
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder(folderName);
      }

      // Loop files
      for (var i = 0; i < data.photos.length; i++) {
        var fileData = data.photos[i];

        // Decode base64
        var rawData = Utilities.base64Decode(fileData.base64);
        var blob = Utilities.newBlob(rawData, fileData.type, fileData.name);

        // Create file inside folder
        var file = folder.createFile(blob);

        // Set file permissions so anyone with the link can view it (useful for sheet inspectors)
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

        photoUrls.push(file.getUrl());
      }
    }

    // 4. Append row values
    var timestamp = new Date();
    var rowValues = [
      timestamp,
      data.type,
      data.reporterName,
      "'" + data.reporterMobile, // Prefix with apostrophe to prevent Sheets from dropping leading zeros
      data.incidentDate,
      data.incidentTime,
      data.vehicleNumber,
      data.location,
      data.hasInjury,
      data.injuryDetails || "N/A",
      data.brief,
      photoUrls.length > 0 ? photoUrls.join("\n") : "No photos"
    ];

    sheet.appendRow(rowValues);

    // Auto-fit column widths
    var cols = sheet.getLastColumn();
    for (var col = 1; col <= cols; col++) {
      sheet.autoResizeColumn(col);
    }

    // Return successful response
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Report saved successfully.",
      row: sheet.getLastRow()
    }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log(error.toString());

    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
