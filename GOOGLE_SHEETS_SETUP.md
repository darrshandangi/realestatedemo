# Google Sheets & Hostinger Demo Setup Guide

This guide explains how to connect your **Google Sheets** to your **Hostinger demo website** so that whenever you add a business name, it generates a personalized website link for outreach.

---

## Part 1: How the Website Personalization Works

Your website in [`Demo websites/real estate website demo`](file:///c:/Users/dangi/Desktop/darshan/AntiGravity/Demo%20websites/real%20estate%20website%20demo) now has [`personalize.js`](file:///c:/Users/dangi/Desktop/darshan/AntiGravity/Demo%20websites/real%20estate%20website%20demo/personalize.js) attached to it.

When you upload this folder to your Hostinger domain (for example `https://yourdomain.com/demo/`):
- Visiting without parameters: Displays default demo text ("Atelier Noir").
- Visiting with parameters: `https://yourdomain.com/demo/?name=Apex+Properties&city=Miami`
  - Logo updates to **Apex Properties**.
  - Hero headline updates to **Apex<br><em>Properties</em>**.
  - Eyebrow updates with **Miami**.
  - All brand text across the page & footer updates to **Apex Properties**.
  - A gold preview pitch banner appears: *"Private Preview: Custom concept designed for Apex Properties — [Claim This Site]"*.

---

## Part 2: Setup in Google Sheets (2 Easy Methods)

### Method 1: Instant Formula (Zero Setup)
In your Google Sheet:
- **Column A**: Business Name (e.g. `Apex Properties`)
- **Column B**: Personalized Website Link

In Cell **B2**, paste this formula:
```excel
=IF(ISBLANK(A2), "", HYPERLINK("https://yourdomain.com/demo/?name=" & ENCODEURL(A2), "https://yourdomain.com/demo/?name=" & ENCODEURL(A2)))
```
*Drag this formula down Column B. Whenever you paste 10 or 100 business names in Column A, Column B immediately outputs the clickable, personalized link for each business.*

---

### Method 2: Google Apps Script (Automated Workflow)
If you want the Google Sheet to automatically generate and write the link whenever you type or paste names, or batch generate links in 1 click:

1. In your Google Sheet, click **Extensions > Apps Script**.
2. Open [`google_sheets_automation.js`](file:///c:/Users/dangi/Desktop/darshan/AntiGravity/Demo%20websites/real%20estate%20website%20demo/google_sheets_automation.js).
3. Copy its contents into the Google Apps Script editor.
4. Replace `https://yourdomain.com/demo/` with your actual Hostinger URL.
5. Click **Save (Ctrl + S)**.
6. Now, whenever you enter a name in Column A, the script automatically writes the link into Column B. You also get a **🚀 Demo Generator** menu at the top of your sheet to generate links for your whole list in 1 click!

---

## Part 3: Test Locally First

You can test right now on your machine by opening [`generator.html`](file:///c:/Users/dangi/Desktop/darshan/AntiGravity/Demo%20websites/real%20estate%20website%20demo/generator.html) in your browser:
1. Type a business name (e.g., *Sotheby Luxury Real Estate*).
2. Click **Test in Browser** or copy the link to see it customize instantly.
