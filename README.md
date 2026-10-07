<div align="center">

# ⚡ Photon Club Certificate System

**Generate, manage and verify event certificates in seconds, with a unique 7-character code and QR code on every certificate.**

[![Live Site](https://img.shields.io/badge/Live-Website-ff4b2b?style=for-the-badge&logo=netlify&logoColor=white)](https://photonclubvitap-certificate-system.netlify.app/)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

🌐 **Live:** https://photonclubvitap-certificate-system.netlify.app/

</div>

---

## 🔑 Admin Access

Use these credentials to access the **Generate Certificates** and **Manage Certificates** tabs:

| Field | Value |
|---|---|
| **Email (Username)** | `mounvik@certificate.com` |
| **Password** | `mounvik@admin` |

---

## 📖 About

The **Photon Club Certificate System** is a lightweight, fully client-side web app built for **Photon Club, VIT-AP University**. Club admins can upload an Excel sheet of participants and generate personalised certificates in bulk. Anyone can then verify or download their certificate using the unique code printed on it, or by scanning its QR code.

No backend server is needed: records are stored in Google Sheets (through a Google Form and a Google Apps Script), and certificates are rendered in the browser.

---

## ✨ Features

### 🔍 Public: Verify Certificate
- Look up a certificate using its **7-character code**
- **Direct verification links** via a URL parameter (`?id=XXXXXXX`), which is what the QR code points to
- **Download** the certificate as PNG or PDF
- **Share** on WhatsApp and **add to LinkedIn** (Licenses & Certifications)

### ⚡ Admin: Generate Certificates
- Upload participant data from an **Excel sheet** (`.xlsx`, `.xls`)
- **Bulk-generate** certificates drawn on a canvas over the certificate template
- Unique code and **QR code** added to each certificate
- Records are automatically **saved to Google Sheets** via Google Forms
- Download everything as a single **ZIP**

### 📊 Admin: Manage Certificates
- Search for a certificate by its ID
- Quick access to the master Google Sheet, protected by a secondary password

### 🎨 UI
- Responsive layout with a **hamburger side panel** on mobile
- Loading overlays, notifications and button loaders
- Orange-themed design matching the Photon Club brand

---

## 🛠️ Tech Stack

| Purpose | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Excel parsing | [SheetJS (xlsx)](https://sheetjs.com/) |
| Rendering | HTML5 Canvas, [html2canvas](https://html2canvas.hertzen.com/) |
| Bulk download | [JSZip](https://stuk.github.io/jszip/) |
| PDF export | [jsPDF](https://github.com/parallax/jsPDF) |
| QR codes | [qrcode](https://github.com/soldair/node-qrcode) (with QuickChart fallback) |
| Data storage | Google Forms → Google Sheets |
| Data lookup | Google Apps Script web app |
| Hosting | Netlify |

---

## 📁 Project Structure

```
├── index.html          # Main app shell (navbar, tabs, footer)
├── admin-login.html    # Standalone admin login page
├── styles.css          # Global styles and theme
├── script.js           # Shared logic: tab navigation, login/logout, notifications, side panel
├── generate.js         # Bulk certificate generation (Excel → canvas → Sheets → ZIP)
├── verify.js           # Certificate lookup, download, share and LinkedIn integration
├── manage.js           # Certificate search and Sheets access
├── logo.png            # Club logo (navbar)
└── profile.png         # Favicon
```

---

## 🚀 Getting Started

### Run locally

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# 2. Serve the folder with any static server, for example:
npx serve .
# or
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

> The project is plain static files, so there is no build step or `npm install`. Opening `index.html` directly also works, but a local server is recommended.

### Deploy

Drag and drop the project folder onto [Netlify](https://app.netlify.com/drop), or connect the repository for automatic deploys.

---

## 📋 How to Use

### Verifying a certificate
1. Open the [website](https://photonclubvitap-certificate-system.netlify.app/).
2. Go to **Verify Certificate** and enter the 7-character code (or scan the QR code on the certificate).
3. View, download or share your certificate.

### Generating certificates (Admin)
1. Log in as admin.
2. Open **Generate Certificates**.
3. Upload your Excel sheet with participant details (name, roll number, college, event, etc.).
4. Choose the certificate type and event details, then click generate.
5. Download the certificates (individually or as a ZIP). Records are saved to Google Sheets automatically.

### Managing certificates (Admin)
1. Log in as admin and open **Manage Certificates**.
2. Search by certificate ID or open the master sheet.

---

## ⚙️ Configuration

Key settings are defined at the top of the JavaScript files:

| Setting | File | Description |
|---|---|---|
| `FORM_ID` / `FIELD_IDS` | `generate.js` | Google Form used to write certificate records into Sheets |
| `CERTIFICATE_TEMPLATE_URL` | `generate.js`, `verify.js` | Background image of the certificate |
| Apps Script URL | `verify.js` | Endpoint used to fetch certificate records |
| Sheet URL | `manage.js` | Master Google Sheet for admins |

To reuse this project for your own club, replace these with your own Google Form, Apps Script, Sheet and template image.

---

## 🔒 Security Note

Authentication in this project is **client-side only** (credentials are checked in the browser using `sessionStorage`). This is fine for a small club tool, but it is **not secure** against someone inspecting the source code. For stronger protection, move authentication to a server or an identity provider (e.g., Netlify Identity, Firebase Auth) and keep secrets out of public JavaScript files.

---

## 📬 Contact

**Developer:** Mounvik Karnati

- 📧 [mounvikkarnati@gmail.com](mailto:mounvikkarnati@gmail.com)
- 💼 [LinkedIn](https://in.linkedin.com/in/mounvikkarnati)
- 📷 [Instagram](https://www.instagram.com/mounvik.karnati/)

**Photon Club, VIT-AP University**

- 🌐 [Official Website](https://photonclubvitap.42web.io/)
- ✉️ [photon.club@vitap.ac.in](mailto:photon.club@vitap.ac.in)
- 💼 [LinkedIn Page](https://in.linkedin.com/company/photon-club-vitap)
- 📷 [Instagram Page](https://www.instagram.com/photonclub.vitap/)

---

## 📜 Copyright

© 2025 **Photon Club, VIT-AP University**. All rights reserved.

This system, its codebase and design were designed and developed by **Mounvik Karnati**. Replication, distribution or unauthorized use without permission is prohibited.

<div align="center">

⚡ Made with passion for Photon Club ⚡

</div>
