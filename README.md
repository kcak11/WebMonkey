# WebMonkey

A Chrome extension that lets you configure and execute custom JavaScript on any webpage.

## Features

- **Custom JavaScript Execution** - Write your own scripts that run automatically on all webpages
- **Bypasses CSP** - Uses Chrome's scripting API to execute scripts even on sites with strict Content Security Policies
- **Simple Configuration** - Easy-to-use options page with code editor
- **Enable/Disable Toggle** - Quickly turn script execution on or off

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the `WebMonkey` folder

## Usage

1. Click the WebMonkey extension icon in Chrome's toolbar
2. Right-click and select **Options** (or go to `chrome://extensions/` → WebMonkey → Details → Extension options)
3. Write your custom JavaScript in the editor
4. Toggle **Enable custom script** on/off as needed
5. Click **Save Script**

Your script will now execute on every webpage you visit (when enabled).

## Examples

### Remove all images from pages
```js
document.querySelectorAll('img').forEach(el => el.remove());
```

### Make all links open in new tabs
```js
document.querySelectorAll('a').forEach(a => a.target = '_blank');
```

### Add a floating button
```js
const btn = document.createElement('button');
btn.textContent = '🤖 Click Me';
btn.style.cssText = 'position:fixed;top:10px;right:10px;zIndex:9999;padding:10px;';
document.body.appendChild(btn);
btn.onclick = () => alert('Hello from WebMonkey!');
```

### Highlight all links
```js
document.querySelectorAll('a').forEach(a => {
  a.style.background = 'yellow';
  a.style.border = '2px solid orange';
});
```

### Remove specific elements by class
```js
document.querySelectorAll('.ads, .banner, .popup').forEach(el => el.remove());
```

### Change page background
```js
document.body.style.background = '#1a1a2e';
document.body.style.color = '#eee';
```

## Privacy

- All scripts run locally in your browser
- No data is sent to any external servers
- Your custom scripts are stored in Chrome's sync storage

## License

MIT License - See [LICENSE](https://mit-license.kcak11.com) file for details.

## Contributing

Feel free to submit issues and pull requests on the repository.