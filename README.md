# Kix - Kick.com Accent Color Changer

Kix is a lightweight browser extension that replaces the default neon volt-green accent color on Kick.com with any custom color you choose.

I made this extension because I hate the color green. Kix gives you full control over Kick's accent aesthetic across the entire site.

Compatible with Chromium browsers (Google Chrome, Brave, Microsoft Edge, Opera, Helium) and Mozilla Firefox.

---

## Features

- Complete Site Coverage: Replaces volt-green across navigation bars, Kick logos, primary buttons, chat input carets, live stream badges, video player scrubbers and volume bars, checkboxes, toggles, active indicators, and text selection highlights.
- Automatic 20-Step Shade Ramp: Calculates Kick's full design system palette (`voltGreen-50` through `voltGreen-1000`) based on your chosen accent color for consistent depth and hover states.
- Intelligent Text Contrast: Automatically evaluates color luminance to set high-contrast text (pure black or pure white) on top of buttons and badges.
- Instant, Zero-Flicker Injection: Executes at document start before Kick's stylesheets render, preventing flashes of the original green.
- Quick Color Presets: Curated swatches including Cyber Cyan, Electric Blue, Neon Purple, Hot Pink, Crimson Red, Sunset Orange, and Sunshine Gold.
- Recently Used Swatches: Stores up to 8 of your most recent colors with one-click re-application.
- Precise Customization: Input any 3- or 6-digit hex code with paste support, or use the real-time Hue, Saturation, and Lightness (HSL) sliders.
- Cross-Browser Synchronous Updates: Applying a new color saves your preference and automatically updates active Kick.com tabs. Reverting to Kick's default green takes a single click.

---

## How It Works

Kick.com is built with Next.js, Tailwind CSS, and custom SVG assets styled with hardcoded color values and CSS custom properties. Rather than simply tinting the page with a filter (which ruins stream video and user avatars), Kix alters Kick's theme at the system level:

1. Early Lifecycle Execution (`document_start`)
   The extension's content script injects as soon as the DOM begins constructing, before Kick's external CSS files finish loading. This prevents the default neon green from flashing when loading or navigating pages.

2. Dynamic Palette and Shade Ramp Calculation
   When you pick a color, Kix parses the hex code into HSL (Hue, Saturation, Lightness). Kick's UI relies on a 20-tier shade ramp (`voltGreen-50` to `voltGreen-1000`) for borders, hover states, badges, and dark tints. Kix algorithmically generates HSL values across all 20 steps, preserving the perceived brightness relationships intended by Kick's designers.

3. Accessible Contrast Detection
   Using the YIQ relative luminance formula (`(r * 299 + g * 587 + b * 114) / 1000`), Kix determines whether the background color is bright or dark, and sets corresponding text and icon colors to pure black or pure white so buttons and badges remain readable.

4. CSS Variable and Utility Override Injection
   Kix generates a dedicated stylesheet and attaches it to the document root. This stylesheet overrides Kick's design token custom properties (`--color-brand`, `--edge-color-brand`, `--kick-voltGreen-*`, etc.) as well as hardcoded Tailwind utility classes (`.bg-kick-voltGreen-150`, `.text-kick-voltGreen-100`, etc.).

5. SVG and Logo Recoloring
   Kick renders its desktop and mobile logos (`kick-logo.svg` and `kick-logo-k.svg`) as `<img>` tags pointing to external SVGs, alongside inline SVG icons with fixed `fill`, `stroke`, and `<linearGradient>` stops. Kix:
   - Encodes updated SVG vector markups into inline data URIs and swaps out logo `src` attributes.
   - Dynamically remaps gradient stops (such as the 3D Kicks coin icon and badges) to match the new accent palette while preserving highlights.

6. MutationObserver for Dynamic Navigation
   Kick is a single-page application (SPA). As you browse categories, open chat panels, or switch channels, new DOM nodes are constantly injected. Kix runs a lightweight `MutationObserver` that detects newly mounted elements and immediately applies the custom logo assets and SVG fills without dropping frames.

7. Cross-Browser Storage Sync
   Settings are stored in the browser's extension storage (`storage.sync` with automatic fallback to `storage.local`). When a setting is updated in the popup, an event listener in the content script re-injects the styling immediately.

---

## Installation Guide

You can install Kix on any major desktop browser directly from the source code.

### 1. Download the Repository

1. Click the green Code button at the top of this GitHub repository.
2. Select Download ZIP and extract the archive to a folder on your computer (or clone the repository using `git clone`).

---

### 2. Google Chrome, Brave, Microsoft Edge, and Opera (Chromium MV3)

Modern Chromium browsers use Manifest V3:

1. Open your browser and go to the extensions manager:
   - Chrome: `chrome://extensions`
   - Brave: `brave://extensions`
   - Edge: `edge://extensions`
   - Opera: `opera://extensions`
2. Turn on Developer mode (usually a toggle switch in the top-right corner).
3. Inside your extracted folder:
   - Modern Chrome/Brave/Edge require the Manifest V3 file. Replace `manifest.json` with `manifest.v3.json` (or rename `manifest.v3.json` to `manifest.json`).
4. In your browser's extensions page, click the Load unpacked button.
5. Select the project folder containing the files.
6. The Kix icon will appear in your toolbar. Pin it for quick access.

---

### 3. Helium Browser or Chromium Manifest V2 Browsers

If you use Helium or another Chromium-based browser supporting Manifest V2:

1. Open your browser and navigate to `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select the project folder (the default `manifest.json` is preconfigured for MV2).
5. Kix is now installed and active.

---

### 4. Mozilla Firefox

#### Option A: Load as a Temporary Add-on (Development)
1. Open Firefox and type `about:debugging#/runtime/this-firefox` in the address bar.
2. Click the Load Temporary Add-on... button.
3. Browse into the project folder and select the `manifest.json` file.
4. Kix is now loaded and available in your toolbar.

#### Option B: Install Packaged Add-on (`.xpi`)
1. Open Firefox and go to `about:addons`.
2. Click the gear icon in the top-right corner of the Add-ons Manager.
3. Select Install Add-on From File....
4. Choose the `kix-firefox.xpi` file included in this repository.
5. Confirm the installation prompt.

---

## How to Use

1. Click the Kix icon in your browser toolbar.
2. Pick a color:
   - Click any preset swatch from the sample colors.
   - Enter or paste any 3- or 6-digit hex code into the input field.
   - Adjust the Hue, Saturation, and Lightness sliders to preview colors in real time.
3. Click Apply:
   - Your choice is saved and active Kick.com tabs reload with your new color applied.
4. Click Reset at any time to return to the original Kick green.

---

## Project Structure

```text
KCP/
|-- manifest.json       Universal Manifest V2 configuration (Firefox & Helium)
|-- manifest.v3.json    Manifest V3 configuration (Chrome, Edge, Brave, Opera)
|-- popup.html          Popup interface
|-- popup.css           Popup styles and slider themes
|-- popup.js            Popup state management, color math, and browser API adapter
|-- content.js          Content script for CSS overrides, SVG recoloring, and DOM observation
|-- background.js       Background worker script compatible with MV2 and MV3
|-- icons/              Extension toolbar and store icons
|-- kix-firefox.xpi     Packaged Firefox add-on
`-- README.md           Project documentation
```

---

## License

This project is open-source. Feel free to modify, customize, and share it.
