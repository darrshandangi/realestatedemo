/**
 * ============================================================================
 * GOOGLE APPS SCRIPT: Automated Personalized Demo Link Generator
 * ============================================================================
 * HOW TO INSTALL IN GOOGLE SHEETS:
 * 1. Open your Google Sheet
 * 2. In the top menu, click: Extensions > Apps Script
 * 3. Delete any default code in Code.gs, paste this entire file, and click Save (Floppy icon).
 * 4. Close the Apps Script tab.
 * 
 * HOW IT WORKS:
 * - Whenever you type or paste a Business Name in Column A (Row 2 and below),
 *   it automatically validates and writes the exact personalized link into Column B!
 * - Also provides a custom menu at the top: "🚀 Demo Generator > Generate All Links"
 *   to generate links for your entire sheet in 1 click.
 * ============================================================================
 */

// 1. CONFIGURE YOUR HOSTED DEMO WEBSITE URL
const BASE_DEMO_URL = "https://darkseagreen-crow-784622.hostingersite.com/"; 

// Optional Default Parameters
const YOUR_AGENCY_NAME = "WebCraft Studio";
const YOUR_CALENDLY_OR_CAL_LINK = "https://cal.com/your-name";

/**
 * Automatically triggers when an edit is made in the Google Sheet.
 */
function onEdit(e) {
  if (!e || !e.range) return;

  const sheet = e.range.getSheet();
  const row = e.range.getRow();
  const col = e.range.getColumn();

  // Trigger only on edits in Column A (Business Name) from row 2 downwards
  if (col === 1 && row > 1) {
    const businessName = e.range.getValue().toString().trim();
    const linkCell = sheet.getRange(row, 2); // Column B

    if (businessName === "") {
      linkCell.clearContent();
      return;
    }

    // Read optional city (Column C) and phone (Column D) if present
    const city = sheet.getRange(row, 3).getValue().toString().trim();
    const phone = sheet.getRange(row, 4).getValue().toString().trim();

    const personalizedUrl = buildPersonalizedUrl(businessName, city, phone);
    
    // Set both the URL and rich clickable hyperlink formula
    linkCell.setValue(personalizedUrl);
  }
}

/**
 * Builds the URL with clean query parameters
 */
function buildPersonalizedUrl(businessName, city, phone) {
  let url = BASE_DEMO_URL;
  if (!url.endsWith('/')) {
    url += '/';
  }
  
  const queryParts = [];
  queryParts.push("name=" + encodeURIComponent(businessName));
  
  if (city) {
    queryParts.push("city=" + encodeURIComponent(city));
  }
  if (phone) {
    queryParts.push("phone=" + encodeURIComponent(phone));
  }
  if (YOUR_AGENCY_NAME) {
    queryParts.push("agency=" + encodeURIComponent(YOUR_AGENCY_NAME));
  }
  if (YOUR_CALENDLY_OR_CAL_LINK) {
    queryParts.push("cal=" + encodeURIComponent(YOUR_CALENDLY_OR_CAL_LINK));
  }

  return url + "?" + queryParts.join("&");
}

/**
 * Custom Menu at the top of Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🚀 Demo Generator")
    .addItem("Generate All Links (Batch)", "generateAllLinks")
    .addToUi();
}

/**
 * Batch generate links for all rows in Column A
 */
function generateAllLinks() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert("No business names found in Column A.");
    return;
  }

  const range = sheet.getRange(2, 1, lastRow - 1, 4); // Columns A to D
  const values = range.getValues();
  const linkValues = [];

  for (let i = 0; i < values.length; i++) {
    const name = values[i][0] ? values[i][0].toString().trim() : "";
    const city = values[i][1] ? values[i][1].toString().trim() : "";
    const phone = values[i][2] ? values[i][2].toString().trim() : "";

    if (name) {
      linkValues.push([buildPersonalizedUrl(name, city, phone)]);
    } else {
      linkValues.push([""]);
    }
  }

  // Write all generated links into Column B
  sheet.getRange(2, 2, linkValues.length, 1).setValues(linkValues);
  SpreadsheetApp.getUi().alert(`✅ Successfully generated ${linkValues.filter(r => r[0] !== "").length} personalized demo links!`);
}
