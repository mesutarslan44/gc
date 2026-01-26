const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'android', 'settings.gradle');
let content = fs.readFileSync(targetFile, 'utf8');

// Replace project name with safe version (no spaces)
content = content.replace("rootProject.name = 'Galaksi Fatihi'", "rootProject.name = 'GalaxyConquest'");

fs.writeFileSync(targetFile, content);
console.log('Successfully updated android/settings.gradle project name to GalaxyConquest.');
