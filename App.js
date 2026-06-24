├── package.json
├── capacitor.config.ts (기존 제공 설정 적용)
├── vite.config.ts
├── index.html
├── src/
│ ├── main.tsx
│ ├── App.tsx (기존 코드)
│ ├── components/
│ │ ├── ErrorBoundary.tsx
│ │ └── ProfitCalcPanel.tsx (기존 코드)
│ ├── contexts/
│ │ └── ThemeContext.tsx
│ ├── pages/
│ │ ├── Home.tsx
│ │ └── NotFound.tsx
│ └── lib/
│ └── checklistData.ts
└── android/ (Capacitor가 자동 생성하지만, 수동 수정을 위한 설정 파일 제공)
├── app/
│ ├── build.gradle
│ └── src/main/AndroidManifest.xml
└── build.gradle 

{
"name": "auction-checklist-app",
"private": true,
"version": "1.0.0",
"type": "module",
"scripts": {
"dev": "vite",
"build": "tsc && vite build",
"lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
"preview": "vite preview",
"static-build": "vite build && cap sync"
},
"dependencies": {
"@capacitor/android": "^6.0.0",
"@capacitor/core": "^6.0.0",
"@capacitor/preferences": "^6.0.0",
"@capacitor/splash-screen": "^6.0.0",
"clsx": "^2.1.1",
"lucide-react": "^0.379.0",
"react": "^18.3.1",
"react-dom": "^18.3.1",
"tailwind-merge": "^2.3.0",
"wouter": "^3.1.2"
},
"devDependencies": {
"@capacitor/cli": "^6.0.0",
"@types/react": "^18.3.3",
"@types/react-dom": "^18.3.0",
"@vitejs/plugin-react": "^4.3.0",
"autoprefixer": "^10.4.19",
"postcss": "^8.4.38",
"tailwind-merge": "^2.3.0",
"tailwindcss": "^3.4.3",
"typescript": "^5.2.2",
"vite": "^5.2.11"
}
} 

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; 

export default defineConfig({
plugins: [react()],
resolve: {
alias: {
'@': path.resolve(__dirname, './src'),
},
},
build: {
outDir: 'dist/public', // capacitor.config.ts의 webDir 설정과 완벽 매칭
emptyOutDir: true,
assetsDir: 'assets',
sourcemap: false,
},
}); 

apply plugin: 'com.android.application' 

android {
namespace "com.auctioncheck.app"
compileSdk 35 // 안드로이드 15 최신 타겟 대응 

defaultConfig {
applicationId "com.auctioncheck.app"
minSdk 26 // 오프라인 로컬 보안 스키마 안정성 확보 (Android 8.0 이상)
targetSdk 35 // 안드로이드 15 대응
versionCode 1
versionName "1.0"
testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner" 

// 칩셋 호환성 확보 및 유니버설 단일 APK 최적화
ndk {
abiFilters 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'
}
} 

buildTypes {
release {
minifyEnabled false
proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
}
}
} 

dependencies {
implementation fileTree(dir: 'libs', include: ['*.jar'])
implementation 'androidx.appcompat:appcompat:1.6.1'
implementation project(':capacitor-android')
implementation project(':capacitor-plugins')
} 

try {
def servicesJSON = file('google-services.json')
if (servicesJSON.text) {
apply plugin: 'com.google.gms.google-services'
}
} catch(Exception e) {
logger.info("google-services.json not found, skipping plugin apply")
} 

<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/apk/res/android"> 

<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" /> 

<application
android:allowBackup="true"
android:icon="@mipmap/ic_launcher"
android:label="@string/app_name"
android:roundIcon="@mipmap/ic_launcher_round"
android:supportsRtl="true"
android:theme="@style/AppTheme"
android:hardwareAccelerated="true"> 

<activity
android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
android:name=".MainActivity"
android:label="@string/title_activity_main"
android:theme="@style/AppTheme.NoActionBar"
android:exported="true"
android:launchMode="singleTop"> 

<intent-filter>
<action android:name="android.intent.action.MAIN" />
<category android:name="android.intent.category.LAUNCHER" />
</intent-filter> 

</activity> 

</application>
</manifest> 

name: Build Android APK 

on:
push:
branches: [ main ] 

jobs:
build:
runs-on: ubuntu-latest
steps:
- uses: actions/checkout@v4 

- name: Set up JDK 17
uses: actions/setup-java@v4
with:
java-version: '17'
distribution: 'zulu' 

- name: Install Dependencies
run: |
npm install
npm run build 

- name: Initialize Capacitor Android
run: |
npx cap add android
npx cap sync 

- name: Build APK with Gradle
run: |
cd android
chmod +x ./gradlew
./gradlew assembleDebug 

- name: Upload APK
uses: actions/upload-artifact@v4
with:
name: app-debug.apk
path: android/app/build/outputs/apk/debug/app-debug.apk