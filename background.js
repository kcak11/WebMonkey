// WebMonkey Background Service Worker
// Handles script injection using chrome.scripting API to bypass CSP

// Open options page when extension icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'injectScript' && sender.tab?.id) {
    injectScript(sender.tab.id, message.script);
  }
});

// Inject script using scripting API (bypasses CSP)
// Uses base64 encoding to handle large/complex scripts
async function injectScript(tabId, script) {
  try {
    // Encode script as base64 using modern TextEncoder API
    const encoder = new TextEncoder();
    const bytes = encoder.encode(script);
    const encodedScript = btoa(String.fromCharCode(...bytes));
    
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      world: 'MAIN', // Execute in page's world, not isolated
      func: (encodedCode) => {
        try {
          const binaryString = atob(encodedCode);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const decoder = new TextDecoder();
          const scriptCode = decoder.decode(bytes);
          
          // Unique policy name to avoid collisions
          const policyName = 'wm-' + Math.random().toString(36).slice(2);
          
          // Helper to get or create Trusted Types policy
          const getPolicy = (types) => {
            if (!window.trustedTypes) return null;
            try {
              return trustedTypes.createPolicy(policyName, types);
            } catch (e) {
              return null;
            }
          };
          
          // Injection methods in order of compatibility
          const methods = [
            // Method 1: Script element with textContent (works on most sites)
            () => {
              const scriptEl = document.createElement('script');
              const policy = getPolicy({ createScript: (i) => i, createHTML: (i) => i, createScriptURL: (i) => i });
              if (policy) {
                scriptEl.textContent = policy.createScript(scriptCode);
              } else {
                scriptEl.textContent = scriptCode;
              }
              document.documentElement.appendChild(scriptEl);
              scriptEl.remove();
              return Promise.resolve(true);
            },
            
            // Method 2: new Function() constructor
            () => {
              const fn = new Function(scriptCode);
              fn.call(window);
              return Promise.resolve(true);
            },
            
            // Method 3: Direct eval
            () => {
              eval(scriptCode);
              return Promise.resolve(true);
            },
            
            // Method 4: Blob URL with Trusted Types (for TrustedScriptURL enforcement)
            () => {
              const blob = new Blob([scriptCode], { type: 'application/javascript' });
              const url = URL.createObjectURL(blob);
              const scriptEl = document.createElement('script');
              const policy = getPolicy({ createScriptURL: (i) => i, createScript: (i) => i, createHTML: (i) => i });
              if (policy) {
                scriptEl.src = policy.createScriptURL(url);
              } else {
                scriptEl.src = url;
              }
              return new Promise((resolve, reject) => {
                const cleanup = () => { scriptEl.remove(); URL.revokeObjectURL(url); };
                scriptEl.onload = () => { cleanup(); resolve(true); };
                scriptEl.onerror = () => { cleanup(); reject(new Error('Blob URL blocked by CSP')); };
                document.documentElement.appendChild(scriptEl);
                setTimeout(() => reject(new Error('Script load timeout')), 2000);
              });
            },
            
            // Method 5: Data URL (another external URL approach)
            () => {
              const dataUrl = 'data:application/javascript;charset=utf-8,' + encodeURIComponent(scriptCode);
              const scriptEl = document.createElement('script');
              const policy = getPolicy({ createScriptURL: (i) => i, createScript: (i) => i, createHTML: (i) => i });
              if (policy) {
                scriptEl.src = policy.createScriptURL(dataUrl);
              } else {
                scriptEl.src = dataUrl;
              }
              return new Promise((resolve, reject) => {
                const cleanup = () => scriptEl.remove();
                scriptEl.onload = () => { cleanup(); resolve(true); };
                scriptEl.onerror = () => { cleanup(); reject(new Error('Data URL blocked by CSP')); };
                document.documentElement.appendChild(scriptEl);
                setTimeout(() => reject(new Error('Script load timeout')), 2000);
              });
            },
            
            // Method 6: setTimeout string eval
            () => {
              setTimeout(scriptCode, 0);
              return Promise.resolve(true);
            }
          ];
          
          // Try each method in sequence
          (async () => {
            for (let i = 0; i < methods.length; i++) {
              try {
                await methods[i]();
                return;
              } catch (methodErr) {
                if (i === methods.length - 1) {
                  console.error('WebMonkey: All injection methods failed. Site has strict security policies.');
                }
              }
            }
          })();
          
        } catch (err) {
          console.error('WebMonkey: Script error:', err);
        }
      },
      args: [encodedScript]
    });
    console.log('WebMonkey: Script injected via scripting API');
  } catch (err) {
    console.error('WebMonkey: Injection failed:', err);
  }
}

// Re-inject script on tab update (navigation)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.startsWith('http')) {
    chrome.storage.local.get(['customScript', 'scriptEnabled'], (result) => {
      const scriptEnabled = result.scriptEnabled !== false;
      const customScript = result.customScript || '';

      if (scriptEnabled && customScript.trim()) {
        injectScript(tabId, customScript);
      }
    });
  }
});