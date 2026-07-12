# Mine Incident & Near Miss Reporting Portal

This project provides a modern, responsive web application for logging safety incidents and near misses in mining operations. Form submissions are processed securely and saved systematically in a Google Sheet, with uploaded photos stored automatically in a Google Drive folder and linked directly in the spreadsheet.

---

## 🛠️ Step-by-Step Google Sheet Setup Guide

Follow these simple steps to configure your database:

### Step 1: Create a Google Sheet
1. Open [Google Sheets](https://sheets.google.com) in your browser.
2. Create a new **Blank Spreadsheet**.
3. Name your spreadsheet something descriptive, e.g., `Mine Incident Database`.
4. *Note: You do not need to type any column headers manually. The script will automatically initialize the sheet with formatted headers on the very first submission!*

### Step 2: Open the Apps Script Editor
1. In the Google Sheets menu bar, click on **Extensions** > **Apps Script**.
2. This opens the Apps Script IDE in a new tab.

### Step 3: Copy and Paste the Script
1. Delete any pre-existing code in the script editor (the default `function myFunction() {}`).
2. Open the file [google_apps_script.js](google_apps_script.js) from this project workspace.
3. Copy the entire contents of that file and paste it into the Apps Script editor.
4. Save the project by clicking the **Save icon (disk)** or pressing `Ctrl + S`.

### Step 4: Deploy the Script as a Web App
1. In the top-right corner of the Apps Script page, click **Deploy** > **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill out the configuration fields:
   - **Description**: `Mine Incident Web App Portal`
   - **Execute as**: Select **Me (your-email@gmail.com)**
   - **Who has access**: Select **Anyone** *(This is extremely important. It permits the form to submit reports without requiring reporters to sign in to Google).*
4. Click the **Deploy** button.

### Step 5: Authorize Google Permissions
1. Google will prompt you to authorize access. Click **Authorize access**.
2. Select your Google Account.
3. Since this is your custom script, Google will display an "Advanced" warning page:
   - Click on **Advanced** (bottom-left link).
   - Click on **Go to Mine Incident Database (unsafe)**.
4. Click **Allow** on the final screen.

### Step 6: Link the Web App URL to the Portal
1. Once deployed, Google will show a screen containing a **Web app URL**.
2. **Copy this URL** (ends in `/exec`).
3. Open `index.html` in your browser.
4. Click the **Google Sheets Setup Instructions** button at the top of the portal.
5. Paste your copied URL into the input field and click **Save URL**.
6. That's it! Your form is now completely linked. Try submitting a test report!

---

## ✨ Features

- **Industrial Aesthetic**: A high-end dark slate layout accented with glowing safety amber and emergency crimson colors.
- **Form Validations**: Complete checks on mandatory parameters, mobile formats, and date boundaries (prevents logging future occurrences).
- **Conditional Visibility**: The "Details of Injury" textarea displays only when **"Injury: Yes"** is selected.
- **Word-Count Safety**: The description textarea actively counts and restricts length to **500 words** with visual color-coded warnings.
- **Drag-and-Drop Uploader**: Custom image area supporting up to 10 image attachments, restricting individual sizes to **10MB** with responsive preview grids and easy delete controls.
- **Google Sheets Sync**: Appends timestamped rows to the sheet, formats headers, and uploads images directly to a Google Drive folder (`Mine Incident Photos`) and links them.

---

## 💻 Local Testing & Hosting

### Run Locally
To run the website locally:
- Simply double-click `index.html` to open it in your browser, or use a local development server like VS Code Live Server or python's simple HTTP server:
```bash
# Python 3
python -m http.server 8000
```
Then navigate to `http://localhost:8000`.

### Technologies Used
- **Frontend Structure**: HTML5 (Semantic and fully accessible)
- **Design styling**: CSS3 (Vanilla styles, animations, and custom CSS grid variables)
- **Logic processing**: Vanilla JS (Modern ES6, fetch redirections, binary FileReaders, local storage configurations)
- **Database Engine**: Google Apps Script & Google Sheets API
