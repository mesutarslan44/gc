const fs = require('fs');
const path = require('path');

// 1. Settings.gradle: Safe name
const settingsPath = path.join(__dirname, 'android', 'settings.gradle');
if (fs.existsSync(settingsPath)) {
    let settingsContent = fs.readFileSync(settingsPath, 'utf8');
    settingsContent = settingsContent.replace(/rootProject.name = .*/, "rootProject.name = 'galaxy_conquest'");
    fs.writeFileSync(settingsPath, settingsContent);
    console.log('Reverted settings.gradle to galaxy_conquest');
}

// 2. Build.gradle: Remove custom buildDir
const buildPath = path.join(__dirname, 'android', 'build.gradle');
if (fs.existsSync(buildPath)) {
    let buildContent = fs.readFileSync(buildPath, 'utf8');
    buildContent = buildContent.replace(/allprojects \{[\s\S]*?buildDir = [\s\S]*?\}/, `allprojects {
  repositories {
    google()
    mavenCentral()
    maven { url 'https://www.jitpack.io' }
  }
}`);
    fs.writeFileSync(buildPath, buildContent);
    console.log('Reverted build.gradle to standard.');
}
