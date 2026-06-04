# Mobile App Setup

This project uses Capacitor to package the existing React/Vite frontend as an Android mobile app.

## Useful Commands

```bash
npm run mobile:sync
npm run mobile:open
npm run mobile:build:android
```

## Android Requirements

Install Android Studio and a JDK, then make sure `JAVA_HOME` points to the JDK folder.

After Java is available, run:

```bash
npm run mobile:build:android
```

The debug APK will be created in:

```text
android/app/build/outputs/apk/debug/
```

## Production Notes

- The mobile app uses the deployed Render backend: `https://mandir-backend-8pc7.onrender.com/api`.
- Run `npm run mobile:sync` after changing frontend code so the Android project receives the latest web build.
- For Play Store release builds, open the Android project in Android Studio and create a signed app bundle.
