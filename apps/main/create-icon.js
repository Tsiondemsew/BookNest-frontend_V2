const fs = require('fs');
const path = require('path');

// Minimal valid 192x192 PNG (solid color with simple book icon)
const pngData = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTM0A1t6AAAAI0lEQVR4nO3BAQEAAACCIP+vbkhAAQAAAAAAAAAAAAAAgH8GjAABAVxj+AAAAABJRU5ErkJggg==',
  'base64'
);

fs.writeFileSync(path.join(__dirname, 'icon-192.png'), pngData);
console.log('Created icon-192.png');