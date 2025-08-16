# Smart Form Auto Filler 🚀

Smart Form Auto Filler is a lightweight Chrome extension that helps you automatically fill web forms using saved profile data (name, email, phone, address, and custom fields). Save time on repetitive forms — configure once and autofill anywhere.

---

## Table of Contents
- Project structure
- Features
- Installation (detailed)
- Usage (step-by-step)
- Configuration & storage
- Troubleshooting
- Contributing
- License

---

## 📂 Project structure

| Path / File                 | Description                                                                 |
|-----------------------------|-----------------------------------------------------------------------------|
| manifest.json               | Chrome extension manifest (permissions, background, content scripts).       |
| popup.html                  | Popup UI shown when the extension icon is clicked.                         |
| popup.js                    | Popup logic: load/save profile data, validation, UI actions.               |
| popup.css                   | Styling for the popup UI.                                                   |
| content.js                  | Injected into web pages; responsible for selecting fields and autofilling.  |
| background.js               | Background script (optional): event/message routing, alarms, listeners.     |
| icons/                      | Extension icons (16x16, 48x48, 128x128).                                    |
| assets/screenshots/         | Placeholder screenshots (popup, demo).                                      |
| README.md                   | This file.                                                                   |

(If your repo differs slightly, adjust file names/paths accordingly.)

---

## ⚡ Features

- Save multiple personal fields: name, email, phone, address, and custom key/value pairs.
- Autofill visible form fields on the current page with one click.
- Lightweight: no external dependencies.
- Minimal UI with validation and preview before saving.
- Uses browser storage (Chrome storage/localStorage) for saved profiles.

---

## ⚙️ Installation (local development)

Follow these exact steps to load and test the extension locally in Chrome or Chromium-based browsers.

1. Clone the repository
   - Open a terminal and run:
     ```
     git clone https://github.com/RajukrRaja/Smart-Form-Auto-Filler.git
     cd Smart-Form-Auto-Filler
     ```

2. Prepare the directory
   - Ensure the following files exist at repo root: `manifest.json`, `popup.html`, `popup.js`, `popup.css`, `content.js`, and `icons/`.
   - If you add screenshots, place them under `assets/screenshots/`.

3. Open Chrome Extensions page
   - In Chrome's address bar enter: `chrome://extensions/`
   - Toggle "Developer mode" on (top-right).

4. Load the extension unpacked
   - Click "Load unpacked".
   - Select the project folder (the folder containing `manifest.json`).
   - The extension should appear and its icon should show in the toolbar.

5. Confirm permissions
   - If manifest requests permissions (e.g., "activeTab", "storage"), Chrome will show them. Accept to enable features.

Notes:
- For development changes, keep the Extensions page open and click the "Reload" button next to the extension after editing files.
- To test a background script or content injection, open DevTools on the target page (F12) and check console logs.

---

## 🚀 Usage (how to use the extension)

1. Open the extension popup
   - Click the extension icon in Chrome's toolbar.

2. Add or update your profile data
   - Fill fields shown in the popup (Name, Email, Phone, Address).
   - Optionally add custom fields — each has a label and a value.
   - Click "Save" (or "Update") to persist data to browser storage.
   - The popup should confirm "Saved successfully" (or show validation errors if fields are invalid).

3. Autofill a form on any page
   - Navigate to a page with a form.
   - Click the extension icon, then click "Fill Form" (or use the popup's Fill action).
   - The content script will attempt to match saved fields to common input names and attributes:
     - Examples: `name`, `fullname`, `first_name`, `last_name`, `email`, `user_email`, `phone`, `tel`, `address`, `street`, etc.
   - Matched fields will be filled automatically. Fields that cannot be matched are left unchanged.

4. Manual adjustments
   - If a field is filled incorrectly, you can edit it directly on the page and optionally update the stored profile from the popup.

5. Removing data
   - Use the popup's "Clear" or "Delete profile" to remove stored data.

---

## Configuration & matching rules

- The content script uses simple heuristics to match inputs:
  - Checks input `name`, `id`, `placeholder`, `aria-label`, and nearby label text for keywords.
  - Typical keywords: `name`, `first`, `last`, `email`, `mail`, `phone`, `tel`, `address`, `street`, `city`, `zip`, `postal`.
- To extend matching:
  - Edit `content.js` to add more attribute checks or custom selectors.
  - Add configurable mappings in `popup.js` to map saved keys to CSS selectors (advanced use).

Storage:
- Saved data is kept in Chrome storage (or localStorage). The UI indicates the storage used.
- Data is stored locally on the browser only (not transmitted) unless you modify the extension to sync via a backend.

---

## Troubleshooting

- Extension not visible after Load unpacked:
  - Ensure manifest.json is valid JSON and specifies required fields (manifest_version, name, version, action/background/content_scripts).
- Autofill doesn't populate fields:
  - Check DevTools console for content script errors.
  - Page may use dynamic frameworks (React/Vue) — you may need to delay injection or run filler after the form renders.
- Permissions errors:
  - Confirm `manifest.json` lists required permissions such as `"activeTab"` and `"storage"`.
- Data not saving:
  - Verify storage API is used correctly and check for console errors in the popup (right-click popup → Inspect).

---

## Privacy & Security

- By default the extension stores data locally.
- Do not add highly sensitive data (e.g., full credit card numbers or passwords) unless you implement encryption and review the security model.
- If you add remote sync, ensure data is encrypted in transit (HTTPS/TLS) and stored securely server-side.

---

## Contributing

- Bug reports and feature requests: open an issue describing your environment and steps to reproduce.
- For code contributions:
  1. Fork the repo.
  2. Create a feature branch: `git checkout -b feature/your-feature`.
  3. Implement changes, add tests if applicable.
  4. Submit a pull request describing the change and reason.

Please follow the repository style and run any lint/format steps before PRing.

---

## Screenshots (placeholders)

Add your screenshots under `assets/screenshots/` and reference them in README like:
![Popup UI](assets/screenshots/popup.png)
![Autofill Demo](assets/screenshots/autofill.png)

---

## License

MIT License © 2025 Raju Kumar Raja

---
