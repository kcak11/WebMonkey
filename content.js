// WebMonkey Content Script
// Signals background script to inject custom JavaScript

(function() {
  'use strict';

  // Skip non-http pages
  if (!location.protocol.startsWith('http')) return;

  // Request script injection from background (bypasses CSP)
  chrome.runtime.sendMessage({ type: 'injectScript' });

})();