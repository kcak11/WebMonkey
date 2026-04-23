// WebMonkey Options Page Script

document.addEventListener('DOMContentLoaded', () => {
  const scriptEnabled = document.getElementById('scriptEnabled');
  const hiddenTextarea = document.getElementById('scriptEditor');
  const saveBtn = document.getElementById('saveBtn');
  const clearBtn = document.getElementById('clearBtn');
  const resetBtn = document.getElementById('resetBtn');
  const statusEl = document.getElementById('status');

  // Default script template
  const defaultScript = `// WebMonkey Custom Script
// This code runs on every page after load

console.log('WebMonkey active on:', location.href);

// Add your custom code below:

`;

  // Initialize CodeMirror
  const editor = CodeMirror(document.getElementById('codeEditor'), {
    mode: 'javascript',
    theme: 'dracula',
    lineNumbers: true,
    lineWrapping: false,
    indentUnit: 2,
    tabSize: 2,
    indentWithTabs: false,
    autofocus: true,
    extraKeys: {
      'Tab': (cm) => {
        cm.replaceSelection('  ', 'end');
      }
    }
  });

  // Load saved settings
  chrome.storage.local.get(['customScript', 'scriptEnabled'], (result) => {
    scriptEnabled.checked = result.scriptEnabled !== false; // Default true
    const script = result.customScript || defaultScript;
    editor.setValue(script);
    hiddenTextarea.value = script;
  });

  // Sync editor content to hidden textarea
  editor.on('change', () => {
    hiddenTextarea.value = editor.getValue();
  });

  // Show status message
  function showStatus(message, isError = false) {
    statusEl.textContent = message;
    statusEl.className = `status ${isError ? 'error' : 'success'}`;
    setTimeout(() => {
      statusEl.className = 'status';
    }, 3000);
  }

  // Save settings
  saveBtn.addEventListener('click', () => {
    const enabled = scriptEnabled.checked;
    const script = editor.getValue();

    chrome.storage.local.set({
      scriptEnabled: enabled,
      customScript: script
    }, () => {
      showStatus('✓ Script saved successfully!');
    });
  });

  // Clear editor
  clearBtn.addEventListener('click', () => {
    if (confirm('Clear the script editor?')) {
      editor.setValue('');
      hiddenTextarea.value = '';
      showStatus('Editor cleared');
    }
  });

  // Reset to defaults
  resetBtn.addEventListener('click', () => {
    if (confirm('Reset all settings? This will clear your custom script.')) {
      chrome.storage.local.set({
        scriptEnabled: true,
        customScript: ''
      }, () => {
        scriptEnabled.checked = true;
        editor.setValue(defaultScript);
        hiddenTextarea.value = defaultScript;
        showStatus('✓ Settings reset to defaults');
      });
    }
  });

  // Auto-save on toggle change
  scriptEnabled.addEventListener('change', () => {
    chrome.storage.local.set({ scriptEnabled: scriptEnabled.checked });
  });
});