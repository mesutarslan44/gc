const fs = require('fs');
const path = require('path');

const buildDir = 'C:/tmp/galaxy_build';
// Ensure build dir exists
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
}

const content = `// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {
  repositories {
    google()
    mavenCentral()
  }
  dependencies {
    classpath('com.android.tools.build:gradle')
    classpath('com.facebook.react:react-native-gradle-plugin')
    classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')
  }
}

allprojects {
  buildDir = "${buildDir}/\${project.name}"
  repositories {
    google()
    mavenCentral()
    maven { url 'https://www.jitpack.io' }
  }
}

apply plugin: "expo-root-project"
apply plugin: "com.facebook.react.rootproject"
`;

const targetFile = path.join(__dirname, 'android', 'build.gradle');
fs.writeFileSync(targetFile, content);
console.log('Successfully updated android/build.gradle with short build path.');
