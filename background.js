// Kix Background Service / Event Script
// Compatible with Chromium Manifest V2 (Helium), Firefox WebExtensions, and Manifest V3

const api = (typeof browser !== 'undefined' && browser.runtime) ? browser : chrome;

if (api && api.runtime && api.runtime.onInstalled) {
  api.runtime.onInstalled.addListener(() => {
    const storageArea = (api.storage && api.storage.sync) ? api.storage.sync : (api.storage ? api.storage.local : null);
    if (!storageArea) return;

    const handleResult = (result) => {
      if (!result || result.kixColor === undefined) {
        try {
          storageArea.set({
            kixColor: '#53FC18',
            kixEnabled: false
          });
        } catch (e) {
          console.warn('Kix init default color set failed:', e);
        }
      }
    };

    try {
      const res = storageArea.get(['kixColor', 'kixEnabled'], handleResult);
      if (res && typeof res.then === 'function') {
        res.then(handleResult).catch(() => {});
      }
    } catch (err) {
      console.warn('Kix init storage check error:', err);
    }
  });
}
