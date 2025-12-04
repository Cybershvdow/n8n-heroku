// Simple script to remind user to generate PWA icons
// Run this after installing sharp: npm install -D sharp

console.log(`
🎨 PWA Icons Needed
===================

To generate proper PWA icons, you can:

1. Use an online tool:
   - https://www.pwabuilder.com/imageGenerator
   - Upload a 512x512 logo
   - Download icons

2. Use sharp (npm package):
   npm install -D sharp

   Then create icons programmatically.

3. Use a design tool:
   - Create 192x192.png and 512x512.png
   - Save to /public folder

For now, the app will work without custom icons.
Chrome will use a default PWA icon.

Recommended icon design:
- Dark background (#0A0E1A)
- "W&P" text in neon lime (#D4FF00)
- Simple and bold
`);
