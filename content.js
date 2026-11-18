// Kix - Kick.com Custom Accent Color Injector
(() => {
  const STYLE_ID = 'kix-custom-accent-style';
  let currentAppliedColor = null;
  let observer = null;

  // Convert HEX to HSL
  function hexToHsl(hex) {
    let c = hex.replace('#', '').trim();
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    if (isNaN(num)) return { h: 102, s: 97, l: 54 };
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
        case gNorm: h = (bNorm - rNorm) / d + 2; break;
        case bNorm: h = (rNorm - gNorm) / d + 4; break;
      }
      h = Math.round(h * 60);
    }
    return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  // Calculate contrast text color (black or white)
  function getContrastText(hex) {
    let c = hex.replace('#', '').trim();
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    if (isNaN(num)) return '#000000';
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    // Relative luminance
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 140) ? '#000000' : '#ffffff';
  }

  // Generate CSS stylesheet
  function generateCss(color) {
    const { h, s, l } = hexToHsl(color);
    const contrast = getContrastText(color);

    // Dynamic gradient facet shades for 3D DS icons (Kicks coin, badges, etc.)
    const lightStop = `hsl(${h}, ${s}%, ${Math.min(94, l + 20)}%)`;
    const midStop = color;
    const mintStop = `hsl(${h}, ${Math.min(100, s + 4)}%, ${Math.min(88, l + 8)}%)`;
    const darkStop = `hsl(${h}, ${s}%, ${Math.max(12, l - 12)}%)`;
    const tealStop = `hsl(${h}, ${s}%, ${Math.max(16, l - 6)}%)`;
    const cyanStop = `hsl(${h}, ${s}%, ${Math.min(90, l + 14)}%)`;
    const iconCheckContrast = (contrast === '#ffffff') ? '#ffffff' : '#000000';

    // Generate shade ramp for voltGreen 50-1000
    const steps = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000];
    let rampVariables = '';
    let rampClasses = '';
    steps.forEach(step => {
      let stepL;
      if (step === 50) stepL = Math.min(95, l + 38);
      else if (step === 100) stepL = Math.min(90, l + 22);
      else if (step === 150) stepL = l;
      else {
        const ratio = (step - 150) / (1000 - 150);
        stepL = Math.max(4, Math.round(l * (1 - ratio * 0.9)));
      }
      const hslVal = `hsl(${h}, ${s}%, ${stepL}%)`;
      rampVariables += `  --edge-color-kick-voltGreen-${step}: ${hslVal} !important;\n`;
      rampVariables += `  --color-kick-voltGreen-${step}: ${hslVal} !important;\n`;
      rampVariables += `  --kick-voltGreen-${step}: ${hslVal} !important;\n`;
      rampVariables += `  --voltGreen-${step}: ${hslVal} !important;\n`;

      rampClasses += `.text-kick-voltGreen-${step} { color: ${hslVal} !important; }\n`;
      rampClasses += `.bg-kick-voltGreen-${step} { background-color: ${hslVal} !important; }\n`;
      rampClasses += `.border-kick-voltGreen-${step} { border-color: ${hslVal} !important; }\n`;
      rampClasses += `.fill-kick-voltGreen-${step} { fill: ${hslVal} !important; }\n`;
      rampClasses += `.stroke-kick-voltGreen-${step} { stroke: ${hslVal} !important; }\n`;
    });

    return `
/* === Kix Extension Custom Accent Styles === */
:root, html, body {
  --kix-accent: ${color} !important;
  --kix-contrast: ${contrast} !important;
${rampVariables}
  --edge-color-surface-fg-brand: ${color} !important;
  --edge-color-media-fg-brand: ${color} !important;
  --edge-color-brand-bg-default: ${color} !important;
  --edge-color-glass-fg-brand: ${color} !important;
  --color-brand-bg-default: ${color} !important;
  --color-brand-fg-default: ${contrast} !important;
  --color-surface-fg-brand: ${color} !important;
  --color-surface-fg-brand-2: ${color} !important;
  --color-brand: ${color} !important;
  --color-brand-default: ${color} !important;
  --edge-color-brand: ${color} !important;
  --edge-color-brand-default: ${color} !important;
  --edge-color-brand-fg-default: ${color} !important;
  --edge-color-surface-brand: ${color} !important;
  --color-success: ${color} !important;
  --edge-color-success: ${color} !important;
  --color-status-success: ${color} !important;
  --edge-color-status-success: ${color} !important;
  --color-status-verified: ${color} !important;
  --edge-color-status-verified: ${color} !important;
  --color-verified: ${color} !important;
  --edge-color-verified: ${color} !important;
}

/* Kick voltGreen Design System Shade Classes */
${rampClasses}

/* Kick voltGreen Tailwind Utility Overrides */
[class*="text-kick-voltGreen"] { color: ${color} !important; }
[class*="fill-kick-voltGreen"] { fill: ${color} !important; }
[class*="stroke-kick-voltGreen"] { stroke: ${color} !important; }
[class*="text-voltGreen"] { color: ${color} !important; }
[class*="fill-voltGreen"] { fill: ${color} !important; }
[class*="stroke-voltGreen"] { stroke: ${color} !important; }
.border-kick-voltGreen-150 { border-color: ${color} !important; }
.bg-kick-voltGreen-150 { background-color: ${color} !important; }
.bg-kick-voltGreen-150\\! { background-color: ${color} !important; }
.text-kick-voltGreen-100 { color: hsl(${h}, ${s}%, ${Math.min(90, l + 20)}%) !important; }
.text-kick-voltGreen-150 { color: ${color} !important; }
.text-surface-fg-brand { color: ${color} !important; }
.text-surface-fg-brand-2 { color: ${color} !important; }
.bg-brand-bg-default { background-color: ${color} !important; color: ${contrast} !important; }
.border-brand-bg-default { border-color: ${color} !important; }
.after\\:bg-kick-voltGreen-150:after { background-color: ${color} !important; }
.focus\\:ring-kick-voltGreen-150:focus { --tw-ring-color: ${color} !important; }
.focus-visible\\:ring-kick-voltGreen-150:focus-visible { --tw-ring-color: ${color} !important; }
.focus-visible\\:bg-green-500:focus-visible { background-color: ${color} !important; }

/* Primary Buttons */
[data-slot="button"][data-variant="primary"],
button[data-variant="primary"] {
  background-color: ${color} !important;
  color: ${contrast} !important;
}

[data-slot="button"][data-variant="primary"]:hover:not([aria-disabled="true"]),
button[data-variant="primary"]:hover:not([aria-disabled="true"]) {
  filter: brightness(1.1) !important;
}

[data-slot="text"][data-variant="primary"] {
  color: ${color} !important;
}

[data-slot="text"][data-variant="primary"] > [data-ds-icon] {
  color: ${color} !important;
}

/* Chat Input Caret */
.editor-input {
  caret-color: ${color} !important;
}

/* Radio buttons, checkboxes & toggles checked state */
[data-state="checked"][class*="voltGreen"],
.data-\\[state\\=checked\\]\\:bg-kick-voltGreen-700[data-state="checked"] {
  background-color: ${color} !important;
}
.data-\\[state\\=checked\\]\\:outline-kick-voltGreen-350[data-state="checked"] {
  outline-color: ${color} !important;
}

/* SVGs with Kick Green fills or strokes */
svg[fill="#53FC18" i], svg[fill="#53fc18" i],
svg[fill="#00E701" i], svg[fill="#00e701" i],
svg[fill="#00f700" i], svg[fill="#00ff00" i],
svg[fill="#05ff76" i], svg[fill="#00ba61" i],
svg[fill="#00ff8c" i], svg[fill="#00c6c1" i],
svg [fill="#53FC18" i], svg [fill="#53fc18" i],
svg [fill="#00E701" i], svg [fill="#00e701" i],
svg [fill="#00f700" i], svg [fill="#00ff00" i],
svg [fill="#05ff76" i], svg [fill="#00ba61" i],
svg [fill="#00ff8c" i], svg [fill="#00c6c1" i],
svg path[fill="#53FC18" i], svg path[fill="#53fc18" i],
svg path[fill="#00E701" i], svg path[fill="#00e701" i],
svg circle[fill="#53FC18" i], svg circle[fill="#53fc18" i],
svg rect[fill="#53FC18" i], svg rect[fill="#53fc18" i],
svg polygon[fill="#53FC18" i], svg polygon[fill="#53fc18" i] {
  fill: ${color} !important;
}

svg[stroke="#53FC18" i], svg[stroke="#53fc18" i],
svg[stroke="#00E701" i], svg[stroke="#00e701" i],
svg[stroke="#00f700" i],
svg [stroke="#53FC18" i], svg [stroke="#53fc18" i],
svg [stroke="#00E701" i], svg [stroke="#00e701" i],
svg path[stroke="#53FC18" i], svg path[stroke="#53fc18" i],
svg circle[stroke="#53FC18" i], svg circle[stroke="#53fc18" i] {
  stroke: ${color} !important;
}

svg[data-state="active"] {
  fill: ${color} !important;
}

/* ======================================================== */
/* Kick DS Kicks Icon (KicksColor) & Gradient Stops        */
/* ======================================================== */
svg[data-ds-icon="KicksColor"] stop[stop-color="#53fc18" i],
svg[data-ds-icon="KicksColor"] stop[stop-color="#53FC18" i],
svg[data-ds-icon*="Kicks" i] stop[stop-color="#53fc18" i],
linearGradient[id*="ds-icon"] stop[stop-color="#53fc18" i],
linearGradient[id*="ds-icon"] stop[stop-color="#53FC18" i] {
  stop-color: ${midStop} !important;
}

svg[data-ds-icon="KicksColor"] stop[stop-color="#00ba61" i],
svg[data-ds-icon*="Kicks" i] stop[stop-color="#00ba61" i],
linearGradient[id*="ds-icon"] stop[stop-color="#00ba61" i] {
  stop-color: ${darkStop} !important;
}

svg[data-ds-icon="KicksColor"] stop[stop-color="#00ff8c" i],
svg[data-ds-icon*="Kicks" i] stop[stop-color="#00ff8c" i],
linearGradient[id*="ds-icon"] stop[stop-color="#00ff8c" i] {
  stop-color: ${mintStop} !important;
}

svg[data-ds-icon="KicksColor"] stop[stop-color="#00c6c1" i],
svg[data-ds-icon*="Kicks" i] stop[stop-color="#00c6c1" i],
linearGradient[id*="ds-icon"] stop[stop-color="#00c6c1" i] {
  stop-color: ${tealStop} !important;
}

svg[data-ds-icon="KicksColor"] stop[stop-color="#ff0" i],
svg[data-ds-icon="KicksColor"] stop[stop-color="#ffff00" i],
svg[data-ds-icon*="Kicks" i] stop[stop-color="#ff0" i],
linearGradient[id*="ds-icon"] stop[stop-color="#ff0" i] {
  stop-color: ${lightStop} !important;
}

svg[data-ds-icon="KicksColor"] stop[stop-color="#01ffff" i]:not([stop-opacity="0"]),
svg[data-ds-icon*="Kicks" i] stop[stop-color="#01ffff" i]:not([stop-opacity="0"]),
linearGradient[id*="ds-icon"] stop[stop-color="#01ffff" i]:not([stop-opacity="0"]) {
  stop-color: ${cyanStop} !important;
}

/* Fallback for any other colored stops in Kicks and DS icons (preserving white highlights) */
svg[data-ds-icon="KicksColor"] stop:not([stop-color="#fff" i]):not([stop-color="#ffffff" i]):not([stop-opacity="0"]),
svg[data-ds-icon*="Kicks" i] stop:not([stop-color="#fff" i]):not([stop-color="#ffffff" i]):not([stop-opacity="0"]),
svg[data-ds-icon*="Verified" i] stop:not([stop-color="#fff" i]):not([stop-color="#ffffff" i]):not([stop-opacity="0"]),
svg[data-ds-icon*="Check" i] stop:not([stop-color="#fff" i]):not([stop-color="#ffffff" i]):not([stop-opacity="0"]) {
  stop-color: ${midStop} !important;
}

/* Black K in Kicks Icon - maintain high contrast */
svg[data-ds-icon="KicksColor"] path[fill="#000"],
svg[data-ds-icon="KicksColor"] path[fill="#000000"],
svg[data-ds-icon="KicksColor"] path[fill="black"],
svg[data-ds-icon*="Kicks" i] path[fill="#000"] {
  fill: ${iconCheckContrast} !important;
}

/* ======================================================== */
/* Verified Badges & Checkmarks                            */
/* ======================================================== */
svg[data-ds-icon="Verified"],
svg[data-ds-icon="VerifiedBadge"],
svg[data-ds-icon="BadgeVerified"],
svg[data-ds-icon="VerifiedCheck"],
svg[data-ds-icon="VerifiedColor"],
svg[data-ds-icon="Checkmark"],
svg[data-ds-icon="CheckmarkColor"],
svg[data-ds-icon="Check"],
svg[data-ds-icon="CheckCircle"],
svg[data-ds-icon="BadgeCheck"],
svg[data-ds-icon="CheckBadge"],
svg[data-ds-icon*="Verified" i],
svg[data-ds-icon*="verified" i],
svg[data-ds-icon*="Check" i],
svg[data-ds-icon*="check" i],
[aria-label*="Verified" i] svg,
[aria-label*="verified" i] svg,
[title*="Verified" i] svg,
[title*="verified" i] svg,
[data-testid*="verified" i] svg {
  color: ${color} !important;
}


/* Verified badge background paths/shapes */
svg[data-ds-icon*="Verified" i] path:not([fill="#000"]):not([fill="#000000"]):not([fill="black"]):not([fill="#fff"]):not([fill="#ffffff"]),
[aria-label*="Verified" i] svg path:not([fill="#000"]):not([fill="#000000"]):not([fill="black"]):not([fill="#fff"]):not([fill="#ffffff"]),
[title*="Verified" i] svg path:not([fill="#000"]):not([fill="#000000"]):not([fill="black"]):not([fill="#fff"]):not([fill="#ffffff"]) {
  fill: ${color} !important;
}

/* Checkmark inside verified badge contrast */
svg[data-ds-icon*="Verified" i] path[fill="#000"],
svg[data-ds-icon*="Verified" i] path[fill="#000000"],
svg[data-ds-icon*="Verified" i] path[fill="black"],
[aria-label*="Verified" i] svg path[fill="#000"],
[aria-label*="Verified" i] svg path[fill="#000000"],
[aria-label*="Verified" i] svg path[fill="black"] {
  fill: ${iconCheckContrast} !important;
}

/* General checkmark icons (menus, settings, dropdowns) */
svg[data-ds-icon="Check"] path,
svg[data-ds-icon="Checkmark"] path,
svg[data-ds-icon*="Check" i] path {
  fill: ${color} !important;
}
svg[data-ds-icon="Check"][fill="currentColor"],
svg[data-ds-icon="Checkmark"][fill="currentColor"] {
  fill: ${color} !important;
  color: ${color} !important;
}

/* Video Player Progress Bars & Volume */
.vjs-play-progress,
.vjs-volume-level,
[class*="progress-fill"] {
  background-color: ${color} !important;
}

/* Selection Highlight */
::selection {
  background-color: ${color} !important;
  color: ${contrast} !important;
}
`;
  }

  // ========================================================
  // DOM Gradient & SVG Element Manipulation
  // ========================================================
  const GREEN_STOPS_MAP = {
    '#53fc18': (c, h, s, l) => c,
    '#00ba61': (c, h, s, l) => `hsl(${h}, ${s}%, ${Math.max(12, l - 12)}%)`,
    '#00ff8c': (c, h, s, l) => `hsl(${h}, ${Math.min(100, s + 4)}%, ${Math.min(88, l + 8)}%)`,
    '#00c6c1': (c, h, s, l) => `hsl(${h}, ${s}%, ${Math.max(16, l - 6)}%)`,
    '#ff0':    (c, h, s, l) => `hsl(${h}, ${s}%, ${Math.min(94, l + 20)}%)`,
    '#ffff00': (c, h, s, l) => `hsl(${h}, ${s}%, ${Math.min(94, l + 20)}%)`,
    '#01ffff': (c, h, s, l) => `hsl(${h}, ${s}%, ${Math.min(90, l + 14)}%)`,
    '#00e701': (c, h, s, l) => c,
    '#00f700': (c, h, s, l) => c,
    '#05ff76': (c, h, s, l) => c
  };

  function updateSvgElements(color) {
    if (!color) return;
    const { h, s, l } = hexToHsl(color);
    const contrast = getContrastText(color);
    const checkContrast = (contrast === '#ffffff') ? '#ffffff' : '#000000';

    // 1. Update all SVG linearGradient stop colors
    const stops = document.querySelectorAll('linearGradient stop');
    stops.forEach(stop => {
      const parentGrad = stop.parentElement;
      if (parentGrad && /moderator|subscriber/i.test(parentGrad.id || '')) {
        return;
      }
      if (stop.closest && stop.closest('[data-testid*="moderator" i], [data-testid*="subscriber" i], [data-ds-icon*="moderator" i], [data-ds-icon*="subscriber" i]')) {
        return;
      }
      const origColor = stop.dataset.kixOrigStopColor || stop.getAttribute('stop-color');
      if (origColor) {
        const lower = origColor.trim().toLowerCase();
        const transformFn = GREEN_STOPS_MAP[lower];
        if (transformFn) {
          if (!stop.dataset.kixOrigStopColor) {
            stop.dataset.kixOrigStopColor = origColor;
          }
          const newColor = transformFn(color, h, s, l);
          if (stop.getAttribute('stop-color') !== newColor) {
            stop.setAttribute('stop-color', newColor);
          }
        }
      }
    });

    // 2. Update verified badges & checkmark icons directly
    const verifiedSvgs = document.querySelectorAll(
      'svg[data-ds-icon*="Verified" i], svg[data-ds-icon*="verified" i], ' +
      '[aria-label*="Verified" i] svg, [title*="Verified" i] svg'
    );
    verifiedSvgs.forEach(svg => {
      if (svg.closest && svg.closest('[data-testid*="moderator" i], [data-testid*="subscriber" i]')) return;
      if (/moderator|subscriber/i.test(svg.getAttribute('data-ds-icon') || '')) return;
      svg.style.color = color;
      const blackPaths = svg.querySelectorAll('path[fill="#000"], path[fill="#000000"], path[fill="black"]');
      blackPaths.forEach(p => {
        p.style.fill = checkContrast;
      });
    });

    // 3. Update Kicks K icon black K contrast
    const kicksSvgs = document.querySelectorAll('svg[data-ds-icon="KicksColor"], svg[data-ds-icon*="Kicks" i]');
    kicksSvgs.forEach(svg => {
      const blackPaths = svg.querySelectorAll('path[fill="#000"], path[fill="#000000"], path[fill="black"]');
      blackPaths.forEach(p => {
        p.style.fill = checkContrast;
      });
    });
  }

  function restoreSvgElements() {
    // Restore gradient stops
    const stops = document.querySelectorAll('stop[data-kix-orig-stop-color]');
    stops.forEach(stop => {
      stop.setAttribute('stop-color', stop.dataset.kixOrigStopColor);
      delete stop.dataset.kixOrigStopColor;
    });

    // Restore verified SVGs
    const verifiedSvgs = document.querySelectorAll(
      'svg[data-ds-icon*="Verified" i], svg[data-ds-icon*="verified" i], ' +
      '[aria-label*="Verified" i] svg, [title*="Verified" i] svg'
    );
    verifiedSvgs.forEach(svg => {
      svg.style.color = '';
      const blackPaths = svg.querySelectorAll('path[fill="#000"], path[fill="#000000"], path[fill="black"]');
      blackPaths.forEach(p => {
        p.style.fill = '';
      });
    });

    // Restore Kicks SVGs
    const kicksSvgs = document.querySelectorAll('svg[data-ds-icon="KicksColor"], svg[data-ds-icon*="Kicks" i]');
    kicksSvgs.forEach(svg => {
      const blackPaths = svg.querySelectorAll('path[fill="#000"], path[fill="#000000"], path[fill="black"]');
      blackPaths.forEach(p => {
        p.style.fill = '';
      });
    });

    // Restore any Mod / Sub badge stops or styles if modified
    const modSubStops = document.querySelectorAll('linearGradient[id*="Moderator" i] stop, radialGradient[id*="Subscriber" i] stop, [data-testid*="moderator" i] stop, [data-testid*="subscriber" i] stop');
    modSubStops.forEach(stop => {
      if (stop.dataset.kixOrigStopColor) {
        stop.setAttribute('stop-color', stop.dataset.kixOrigStopColor);
        delete stop.dataset.kixOrigStopColor;
      }
    });
  }

  // Inject or update style tag
  function applyAccentColor(color) {
    currentAppliedColor = color;
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      // Inject as early as possible
      const target = document.head || document.documentElement;
      if (target) {
        target.appendChild(style);
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          (document.head || document.documentElement).appendChild(style);
        });
      }
    }
    style.textContent = generateCss(color);
    updateLogos(color);
    updateSvgElements(color);
    startDomObserver(color);
  }

  // Remove injected styles (Reset to Kick default)
  function removeAccentColor() {
    currentAppliedColor = null;
    const style = document.getElementById(STYLE_ID);
    if (style) {
      style.remove();
    }
    restoreDefaultLogos();
    restoreSvgElements();
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  // Kick logo SVG strings with custom color
  function getKickLogoFullDataUrl(color) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 24"><path fill="${color}" fill-rule="evenodd" d="M0 .028h7.7v5.32h2.561v-2.66h2.562V.028h7.7v7.996H17.96v2.66h-2.562v2.66h2.562v2.66h2.562V24h-7.699v-2.66h-2.562v-2.66H7.7V24H0V.028Zm51.364 0h7.7v5.32h2.561v-2.66h2.562V.028h7.7v7.996h-2.563v2.66h-2.562v2.66h2.563v2.66h2.561V24h-7.699v-2.66h-2.562v-2.66h-2.562V24h-7.699V.028Zm-28.251 0h7.699V24h-7.7V.028Zm12.837 0v2.66h-2.562v18.638h2.562v2.66h12.838V15.99h-7.7V7.994h7.7V0H35.95v.028Z" clip-rule="evenodd"/></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function getKickLogoKDataUrl(color) {
    const svg = `<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1 0H9.76711V5.79452H12.589V2.82193H15.5616V0H24.1781V8.61645H21.3561V11.589H18.3836V14.411H21.3561V17.3836H24.1781V26H15.5616V23.1781H12.589V20.2055H9.76711V26H1V0Z" fill="${color}"/></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function updateLogos(color) {
    if (!color) return;
    const fullUrl = getKickLogoFullDataUrl(color);
    const kUrl = getKickLogoKDataUrl(color);

    // Replace desktop and mobile logos
    const fullLogos = document.querySelectorAll('img[src*="kick-logo.svg"]');
    fullLogos.forEach(img => {
      if (img.src !== fullUrl) {
        img.dataset.kixOriginalSrc = img.dataset.kixOriginalSrc || img.src;
        img.src = fullUrl;
      }
    });

    const kLogos = document.querySelectorAll('img[src*="kick-logo-k.svg"]');
    kLogos.forEach(img => {
      if (img.src !== kUrl) {
        img.dataset.kixOriginalSrc = img.dataset.kixOriginalSrc || img.src;
        img.src = kUrl;
      }
    });
  }

  function restoreDefaultLogos() {
    const imgs = document.querySelectorAll('img[data-kix-original-src]');
    imgs.forEach(img => {
      img.src = img.dataset.kixOriginalSrc;
      delete img.dataset.kixOriginalSrc;
    });
  }

  function startDomObserver(color) {
    if (observer) observer.disconnect();
    observer = new MutationObserver(() => {
      if (currentAppliedColor) {
        updateLogos(currentAppliedColor);
        updateSvgElements(currentAppliedColor);
      }
    });

    const targetNode = document.body || document.documentElement;
    if (targetNode) {
      observer.observe(targetNode, {
        childList: true,
        subtree: true
      });
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        if (document.body) {
          observer.observe(document.body, { childList: true, subtree: true });
        }
      });
    }
  }

  // Load saved setting on initial startup and listen for changes
  function init() {
    const api = (typeof browser !== 'undefined' && browser.storage) ? browser : (typeof chrome !== 'undefined' ? chrome : null);
    if (!api || !api.storage) return;

    const storageArea = (api.storage.sync) ? api.storage.sync : api.storage.local;
    if (!storageArea) return;

    const querySetting = (callback) => {
      try {
        const p = storageArea.get(['kixColor', 'kixEnabled'], (result) => {
          if (!api.runtime?.lastError && result) {
            callback(result);
          }
        });
        if (p && typeof p.then === 'function') {
          p.then(callback).catch(() => {});
        }
      } catch (e) {
        console.warn('Kix content: storage get error', e);
      }
    };

    querySetting((result) => {
      if (result && result.kixEnabled && result.kixColor) {
        applyAccentColor(result.kixColor);
      }
    });

    // Listen for runtime storage updates
    if (api.storage.onChanged) {
      api.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync' || area === 'local') {
          if (changes.kixEnabled || changes.kixColor) {
            querySetting((result) => {
              if (result && result.kixEnabled && result.kixColor) {
                applyAccentColor(result.kixColor);
              } else {
                removeAccentColor();
              }
            });
          }
        }
      });
    }
  }

  init();
})();
