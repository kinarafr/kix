// Kix - Kick Color Changer Popup Logic
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const headerDot = document.getElementById('headerDot');
  const previewSwatch = document.getElementById('previewSwatch');
  const previewHex = document.getElementById('previewHex');
  const presetContainer = document.getElementById('presetContainer');
  const recentContainer = document.getElementById('recentContainer');
  const recentHint = document.getElementById('recentHint');
  const hexInput = document.getElementById('hexInput');
  const hexHint = document.getElementById('hexHint');
  const pasteBtn = document.getElementById('pasteBtn');
  const hueSlider = document.getElementById('hueSlider');
  const satSlider = document.getElementById('satSlider');
  const lightSlider = document.getElementById('lightSlider');
  const hueVal = document.getElementById('hueVal');
  const satVal = document.getElementById('satVal');
  const lightVal = document.getElementById('lightVal');
  const applyBtn = document.getElementById('applyBtn');
  const resetBtn = document.getElementById('resetBtn');
  const statusIndicator = document.querySelector('.status-indicator');
  const statusText = document.getElementById('statusText');

  const DEFAULT_KICK_COLOR = '#53FC18';
  const MAX_RECENT_COLORS = 8;
  let recentColors = [];
  let currentHex = DEFAULT_KICK_COLOR;
  let currentH = 104;
  let currentS = 97;
  let currentL = 54;

  // --- Cross-Browser Extension API Adapter (Helium MV2, Firefox MV2/MV3, Chrome) ---
  const browserApi = (typeof browser !== 'undefined' && browser.runtime) ? browser : chrome;

  const storage = {
    get: (keys) => new Promise((resolve) => {
      try {
        if (typeof browser !== 'undefined' && browser.storage?.sync?.get) {
          browser.storage.sync.get(keys).then(resolve).catch(() => {
            if (browser.storage?.local?.get) {
              browser.storage.local.get(keys).then(resolve).catch(() => resolve({}));
            } else {
              resolve({});
            }
          });
        } else if (typeof chrome !== 'undefined' && chrome.storage?.sync?.get) {
          chrome.storage.sync.get(keys, (res) => {
            if (chrome.runtime?.lastError && chrome.storage?.local?.get) {
              chrome.storage.local.get(keys, (localRes) => resolve(localRes || {}));
            } else {
              resolve(res || {});
            }
          });
        } else {
          resolve({});
        }
      } catch (err) {
        resolve({});
      }
    }),
    set: (items) => new Promise((resolve, reject) => {
      try {
        if (typeof browser !== 'undefined' && browser.storage?.sync?.set) {
          browser.storage.sync.set(items).then(resolve).catch((err) => {
            if (browser.storage?.local?.set) {
              browser.storage.local.set(items).then(resolve).catch(reject);
            } else {
              reject(err);
            }
          });
        } else if (typeof chrome !== 'undefined' && chrome.storage?.sync?.set) {
          chrome.storage.sync.set(items, () => {
            if (chrome.runtime?.lastError) {
              if (chrome.storage?.local?.set) {
                chrome.storage.local.set(items, () => resolve());
              } else {
                reject(chrome.runtime.lastError);
              }
            } else {
              resolve();
            }
          });
        } else {
          resolve();
        }
      } catch (err) {
        reject(err);
      }
    })
  };

  const tabs = {
    query: (queryInfo) => new Promise((resolve) => {
      try {
        if (typeof browser !== 'undefined' && browser.tabs?.query) {
          browser.tabs.query(queryInfo).then(resolve).catch(() => resolve([]));
        } else if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
          chrome.tabs.query(queryInfo, (res) => resolve(res || []));
        } else {
          resolve([]);
        }
      } catch (err) {
        resolve([]);
      }
    }),
    reload: (tabId) => new Promise((resolve) => {
      try {
        if (typeof browser !== 'undefined' && browser.tabs?.reload) {
          browser.tabs.reload(tabId).then(resolve).catch(() => resolve());
        } else if (typeof chrome !== 'undefined' && chrome.tabs?.reload) {
          chrome.tabs.reload(tabId, () => resolve());
        } else {
          resolve();
        }
      } catch (err) {
        resolve();
      }
    })
  };

  // --- Color Conversion Functions ---
  function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [
      Math.round(f(0) * 255),
      Math.round(f(8) * 255),
      Math.round(f(4) * 255)
    ];
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  function hexToRgb(hex) {
    let c = hex.replace('#', '').trim();
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    if (isNaN(num)) return [83, 252, 24];
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  function rgbToHsl(r, g, b) {
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

  function getContrast(hex) {
    const [r, g, b] = hexToRgb(hex);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 140 ? '#000000' : '#ffffff';
  }

  // --- UI Update Helpers ---
  function updateUI(skipInput = false, skipSliders = false) {
    // 1. Text labels and preview
    previewHex.textContent = currentHex;
    previewSwatch.style.backgroundColor = currentHex;
    headerDot.style.backgroundColor = currentHex;
    headerDot.style.boxShadow = `0 0 10px ${currentHex}`;

    // 2. CSS variables for button and dynamic styling
    document.documentElement.style.setProperty('--kix-accent', currentHex);
    document.documentElement.style.setProperty('--kix-contrast', getContrast(currentHex));

    // 3. Sliders track gradients & values
    hueVal.textContent = `${currentH}°`;
    satVal.textContent = `${currentS}%`;
    lightVal.textContent = `${currentL}%`;

    satSlider.style.background = `linear-gradient(to right, hsl(${currentH}, 0%, ${currentL}%), hsl(${currentH}, 100%, ${currentL}%))`;
    lightSlider.style.background = `linear-gradient(to right, #000000, hsl(${currentH}, ${currentS}%, 50%), #ffffff)`;

    if (!skipSliders) {
      hueSlider.value = currentH;
      satSlider.value = currentS;
      lightSlider.value = currentL;
    }

    if (!skipInput) {
      hexInput.value = currentHex.replace('#', '');
    }

    // 4. Update preset active indicators
    const normalizedCurrent = currentHex.toUpperCase();
    document.querySelectorAll('.sample-swatch').forEach(swatch => {
      const swatchColor = swatch.dataset.color.toUpperCase();
      if (swatchColor === normalizedCurrent) {
        swatch.classList.add('active');
      } else {
        swatch.classList.remove('active');
      }
    });
  }

  function setFromHsl(h, s, l, skipSliders = false) {
    currentH = Math.max(0, Math.min(360, h));
    currentS = Math.max(0, Math.min(100, s));
    currentL = Math.max(0, Math.min(100, l));
    const [r, g, b] = hslToRgb(currentH, currentS, currentL);
    currentHex = rgbToHex(r, g, b);
    updateUI(false, skipSliders);
  }

  function setFromHex(hex, skipInput = false) {
    let clean = hex.replace(/[^0-9a-fA-F]/g, '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    if (clean.length === 6) {
      currentHex = '#' + clean.toUpperCase();
      const [r, g, b] = hexToRgb(currentHex);
      const hsl = rgbToHsl(r, g, b);
      currentH = hsl.h;
      currentS = hsl.s;
      currentL = hsl.l;
      updateUI(skipInput, false);
      return true;
    }
    return false;
  }

  function showStatus(text, type = 'normal') {
    statusText.textContent = text;
    statusIndicator.className = 'status-indicator';
    if (type === 'success') statusIndicator.classList.add('success');
    if (type === 'warn') statusIndicator.classList.add('warn');
  }

  // --- Event Listeners: HSL Sliders ---
  hueSlider.addEventListener('input', (e) => {
    setFromHsl(parseInt(e.target.value, 10), currentS, currentL, true);
  });

  satSlider.addEventListener('input', (e) => {
    setFromHsl(currentH, parseInt(e.target.value, 10), currentL, true);
  });

  lightSlider.addEventListener('input', (e) => {
    setFromHsl(currentH, currentS, parseInt(e.target.value, 10), true);
  });

  // --- Event Listeners: Hex Input ---
  hexInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (setFromHex(val, true)) {
      hexHint.textContent = 'Valid hex';
      hexHint.style.color = '#10b981';
    } else {
      hexHint.textContent = '3 or 6 hex digits';
      hexHint.style.color = '';
    }
  });

  hexInput.addEventListener('blur', () => {
    // Re-format on blur to clean 6-digit hex
    hexInput.value = currentHex.replace('#', '');
    hexHint.textContent = 'Paste or type code';
    hexHint.style.color = '';
  });

  // Paste button
  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (setFromHex(text.trim())) {
          showStatus('Pasted from clipboard!', 'success');
        } else {
          showStatus('Clipboard has invalid hex', 'warn');
        }
      }
    } catch (err) {
      hexInput.focus();
      showStatus('Paste using Ctrl+V', 'normal');
    }
  });

  // --- Event Listeners: Sample Colors (Presets) ---
  presetContainer.addEventListener('click', (e) => {
    const swatch = e.target.closest('.sample-swatch');
    if (!swatch) return;
    const color = swatch.dataset.color;
    if (color) {
      setFromHex(color);
      showStatus(`Selected ${swatch.title || color}`, 'normal');
    }
  });

  // --- Recently Used Colors Logic ---
  function renderRecentColors() {
    if (!recentContainer) return;
    recentContainer.innerHTML = '';
    const normalizedCurrent = currentHex.toUpperCase();

    // Render swatches for stored recent colors (up to 8)
    recentColors.forEach((color) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sample-swatch recent-swatch';
      btn.dataset.color = color;
      btn.title = `Recently used: ${color}`;
      btn.style.setProperty('--swatch-color', color);
      if (color.toUpperCase() === normalizedCurrent) {
        btn.classList.add('active');
      }
      recentContainer.appendChild(btn);
    });

    // Fill remaining slots up to 8 with empty placeholders
    const emptyCount = MAX_RECENT_COLORS - recentColors.length;
    for (let i = 0; i < emptyCount; i++) {
      const emptySlot = document.createElement('div');
      emptySlot.className = 'recent-swatch-empty';
      emptySlot.title = 'Empty slot';
      recentContainer.appendChild(emptySlot);
    }

    if (recentHint) {
      recentHint.textContent = recentColors.length > 0
        ? `${recentColors.length}/${MAX_RECENT_COLORS} colors`
        : 'Recent (max 8)';
    }
  }

  async function addRecentColor(hex) {
    if (!hex) return;
    const cleanHex = hex.toUpperCase();
    // Remove if already in list so it moves to front (most recently used)
    recentColors = recentColors.filter(c => c.toUpperCase() !== cleanHex);
    // Add to front
    recentColors.unshift(cleanHex);
    // When users use more than 8 colors, oldest one gets deleted
    if (recentColors.length > MAX_RECENT_COLORS) {
      recentColors = recentColors.slice(0, MAX_RECENT_COLORS);
    }
    try {
      await storage.set({ kixRecentColors: recentColors });
    } catch (err) {
      console.warn('Could not save recent colors:', err);
    }
    renderRecentColors();
  }

  if (recentContainer) {
    recentContainer.addEventListener('click', (e) => {
      const swatch = e.target.closest('.recent-swatch');
      if (!swatch) return;
      const color = swatch.dataset.color;
      if (color) {
        setFromHex(color);
        showStatus(`Selected recent color ${color}`, 'normal');
      }
    });
  }

  // --- Webpage Reload Helper ---
  async function reloadKickWebpages() {
    let reloadedCount = 0;
    try {
      // 1. Check current active tab
      const activeTabs = await tabs.query({ active: true, currentWindow: true });
      const activeTab = activeTabs && activeTabs.length > 0 ? activeTabs[0] : null;
      if (activeTab && activeTab.url && activeTab.url.includes('kick.com')) {
        await tabs.reload(activeTab.id);
        reloadedCount++;
      }

      // 2. Also check any other kick.com tabs
      const kickTabs = await tabs.query({ url: '*://*.kick.com/*' });
      for (const tab of kickTabs) {
        if (!activeTab || tab.id !== activeTab.id) {
          await tabs.reload(tab.id);
          reloadedCount++;
        }
      }
    } catch (err) {
      console.warn('Error reloading tabs:', err);
    }
    return reloadedCount;
  }

  // --- Apply Button ---
  applyBtn.addEventListener('click', async () => {
    applyBtn.disabled = true;
    showStatus('Applying color...', 'normal');

    try {
      // Save setting
      await storage.set({
        kixColor: currentHex,
        kixEnabled: true
      });
      await addRecentColor(currentHex);

      // Reload kick tab(s)
      const reloaded = await reloadKickWebpages();
      if (reloaded > 0) {
        showStatus(`Applied! Reloaded ${reloaded} Kick tab${reloaded > 1 ? 's' : ''}`, 'success');
      } else {
        showStatus('Applied! (Open Kick.com to see)', 'success');
      }
    } catch (err) {
      console.error('Error applying color:', err);
      showStatus('Failed to apply', 'warn');
    } finally {
      setTimeout(() => {
        applyBtn.disabled = false;
      }, 500);
    }
  });

  // --- Reset Button ---
  resetBtn.addEventListener('click', async () => {
    resetBtn.disabled = true;
    showStatus('Resetting to default...', 'normal');

    try {
      // Reset state in storage
      await storage.set({
        kixColor: DEFAULT_KICK_COLOR,
        kixEnabled: false
      });

      // Reset UI controls
      setFromHex(DEFAULT_KICK_COLOR);

      // Reload kick tab(s)
      const reloaded = await reloadKickWebpages();
      if (reloaded > 0) {
        showStatus('Reset to default & reloaded Kick!', 'success');
      } else {
        showStatus('Reset to Kick default green', 'success');
      }
    } catch (err) {
      console.error('Error resetting color:', err);
      showStatus('Failed to reset', 'warn');
    } finally {
      setTimeout(() => {
        resetBtn.disabled = false;
      }, 500);
    }
  });

  // --- Initial Load from Storage ---
  (async () => {
    try {
      const result = await storage.get(['kixColor', 'kixEnabled', 'kixRecentColors']);
      if (result && Array.isArray(result.kixRecentColors)) {
        recentColors = result.kixRecentColors
          .filter(c => typeof c === 'string' && /^#[0-9A-Fa-f]{6}$/.test(c))
          .map(c => c.toUpperCase())
          .slice(0, MAX_RECENT_COLORS);
      } else if (result && result.kixColor && result.kixEnabled) {
        recentColors = [result.kixColor.toUpperCase()];
      }
      renderRecentColors();

      if (result && result.kixColor) {
        setFromHex(result.kixColor);
        if (result.kixEnabled) {
          showStatus(`Active accent: ${result.kixColor}`, 'success');
        } else {
          showStatus('Default Kick green active', 'normal');
        }
      } else {
        setFromHex(DEFAULT_KICK_COLOR);
        showStatus('Ready', 'normal');
      }
    } catch (err) {
      setFromHex(DEFAULT_KICK_COLOR);
      renderRecentColors();
      showStatus('Ready', 'normal');
    }
  })();
});

