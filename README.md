# Kix — Kick.com Accent Color Changer

**Kix** is a lightweight, modern cross-browser extension that replaces the default volt-green accent color on [Kick.com](https://kick.com) with any color of your choice across the entire website.

Engineered with dual compatibility for **Helium Browser (Chromium Manifest V2)**, **Mozilla Firefox (Gecko MV2 / WebExtensions)**, and **Chromium MV3** browsers.

---

## ✨ Features

- **Whole Site Coverage**: Replaces Kick's default volt-green (`#53FC18` / `#00E701`) across all pages — navigation bar, Kick logos, primary buttons, chat caret, live stream badges, video player progress & volume bars, checkboxes, active states, and selection highlights.
- **Dynamic 20-Shade Color Ramp**: Automatically generates Kick's complete design system shade ramp (`voltGreen-50` through `voltGreen-1000`) based on your chosen accent color for harmonious UI depth.
- **Fast & Zero-Flicker**: Runs at `document_start` before Kick's stylesheets render, eliminating any flash of default green.
- **Sample Colors (Presets)**: One-click swatches for popular aesthetics (Cyber Cyan, Electric Blue, Neon Purple, Hot Pink, Crimson Red, Sunset Orange, Sunshine Gold, Kick Green).
- **Recently Used Colors**: Stores up to 8 of your recently applied colors with one-click re-selection, automatic FIFO rotation (deleting the oldest once exceeding 8), and persistent storage.
- **Hex Input with Paste Support**: Type or paste any 3- or 6-digit hex code with instant sync.
- **Interactive HSL Sliders**:
  - **Hue Slider** (0°–360°) with rainbow gradient track.
  - **Saturation Slider** (0%–100%) with dynamic saturation gradient.
  - **Lightness Slider** (0%–100%) with dynamic contrast gradient.
  - Styled natively for both WebKit/Blink and Gecko (`::-moz-range-thumb`).
- **Cross-Browser Synchronous Reload**:
  - **Apply**: Saves your color across storage and automatically reloads active Kick.com tabs.
  - **Reset**: Reverts back to Kick's default green and refreshes the page.
- **Minimal, Dark-Themed UI**: Clean, responsive popup matching the streaming environment.

---

## 🚀 Installation Guide

### 1. Helium Browser (Chromium MV2)

Helium is a privacy-focused Chromium browser with native Manifest V2 support:

1. Open **Helium Browser**.
2. Navigate to the extensions manager by visiting:
   ```text
   chrome://extensions
   ```
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **"Load unpacked"** in the top-left corner.
5. Select this extension directory:
   ```text
   e:\Projects\Kick Color Picker\KCP
   ```
6. The **Kix** extension icon will appear in your toolbar!

---

### 2. Mozilla Firefox (Gecko MV2 / WebExtensions)

Firefox natively supports Manifest V2 WebExtensions:

#### Option A: Load Temporary Add-on (For Development & Testing)
1. Open **Firefox**.
2. In the URL bar, go to:
   ```text
   about:debugging#/runtime/this-firefox
   ```
3. Click the **"Load Temporary Add-on..."** button.
4. Select `manifest.json` inside this folder:
   ```text
   e:\Projects\Kick Color Picker\KCP\manifest.json
   ```
   *(Or select the packaged `kix-firefox.xpi` / `kix-extension.zip` in this directory).*
5. **Kix** is immediately active and pinned to your extensions menu!

#### Option B: Install Packaged `.xpi`
1. Drag and drop `kix-firefox.xpi` directly into any open Firefox tab, or go to `about:addons` ➔ click the gear icon ➔ **"Install Add-on From File..."** and select `kix-firefox.xpi`.

---

### 3. Google Chrome, Edge, Brave & Opera (Manifest V3)

If you need to install Kix in modern Google Chrome or other browsers enforcing Manifest V3:
1. Rename or copy `manifest.v3.json` to `manifest.json`.
2. Go to `chrome://extensions` (or `edge://extensions`, `brave://extensions`).
3. Enable **Developer mode** and click **"Load unpacked"**.
4. Select the `KCP` folder.

---

## 🎯 How to Use

1. Click the **Kix** icon in your browser toolbar.
2. Choose your accent color in any of three ways:
   - Click one of the **Sample Color swatches**.
   - Type or paste a hex code into the **Hex Color** input.
   - Adjust the **Hue**, **Saturation**, and **Lightness** sliders.
3. Click **Apply**:
   - The color is saved and your Kick.com tab automatically reloads with the new accent color applied everywhere.
4. To revert back to the original Kick green, click **Reset**.

---

## 📂 Project Structure

```
KCP/
├── manifest.json       # Universal Manifest V2 configuration (Helium & Firefox)
├── manifest.v3.json    # Manifest V3 configuration (Chrome Web Store / MV3 browsers)
├── popup.html          # Clean, minimal popup user interface
├── popup.css           # Styling with WebKit & Mozilla range sliders
├── popup.js            # Cross-browser normalized storage, tabs, & slider controls
├── content.js          # Injected at document_start to restyle Kick & recolor logos
├── background.js       # Background event script compatible with MV2 & MV3
├── icons/              # Extension icons (16px, 32px, 48px, 128px, 512px)
├── kix-firefox.xpi     # Ready-to-install Firefox extension bundle
├── kix-extension.zip   # Ready-to-install zip bundle
└── README.md           # Documentation and setup instructions
```
