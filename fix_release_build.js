const fs = require('fs');
const path = require('path');

// 1. Settings.gradle: Set safe rootProject.name (no spaces)
const settingsPath = path.join(__dirname, 'android', 'settings.gradle');
if (fs.existsSync(settingsPath)) {
    let settingsContent = fs.readFileSync(settingsPath, 'utf8');
    // Force safe internal name regardless of what prebuild put there
    settingsContent = settingsContent.replace(/rootProject.name = .*/, "rootProject.name = 'GalaxyConquest'");
    fs.writeFileSync(settingsPath, settingsContent);
    console.log('Fixed settings.gradle: rootProject.name = GalaxyConquest');
}

// 2. Build.gradle: Short build path
const buildPath = path.join(__dirname, 'android', 'build.gradle');
if (fs.existsSync(buildPath)) {
    let buildContent = fs.readFileSync(buildPath, 'utf8');
    // Remove previous injection if any to avoid duplication
    buildContent = buildContent.replace(/buildDir = .*/, "");

    // Inject clean buildDir
    const buildDirConfig = `allprojects {
  buildDir = "C:/tmp/gc/\${project.name}"`;

    buildContent = buildContent.replace('allprojects {', buildDirConfig);
    fs.writeFileSync(buildPath, buildContent);
    console.log('Fixed build.gradle: buildDir = C:/tmp/gc/...');
}

// 3. Strings.xml: Ensure correctly displayed name "Galaksi Fatihi"
const stringsPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', 'values', 'strings.xml');
if (fs.existsSync(stringsPath)) {
    let stringsContent = fs.readFileSync(stringsPath, 'utf8');
    if (!stringsContent.includes('Galaksi Fatihi')) {
        stringsContent = stringsContent.replace(/<string name="app_name">.*<\/string>/, '<string name="app_name">Galaksi Fatihi</string>');
        fs.writeFileSync(stringsPath, stringsContent);
        console.log('Fixed strings.xml: app_name = Galaksi Fatihi');
    }
}
