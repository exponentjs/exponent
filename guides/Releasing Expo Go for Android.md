# Releasing Expo Go for Android

This document will guide you through the process of releasing a new version of Expo Go for Android.

1. **Bump versions of Android project**

    **Why:** Every new version of Expo Go has to have another version and version code.

    **How:** Edit `/android/app/build.gradle` and bump versions in that file.

2. **Add changelog for Play Store**

    **Why:** It's polite to inform users why they may want to upgrade to latest version of an app.
    
    **How:** Add a new file under `/fastlane/android/metadata/en-US/changelogs/[versionCode].txt` (most probably it can read “Add support for SDK XX”).

3. **Test the application**

    **Why:** For our convenience it's the CI who builds the APK. Before submitting it anywhere we want to test it properly.

    **How:** On the release branch (`sdk-XX`) from which any updates are published, open the `client_android` job for commit after step 2., download build artifact from under `/root/expo/android/app/build/outputs/apk/release/app-release.apk`.
      - Run `adb shell pm clear host.exp.exponent`
      - Enable airplane mode on the device you'll be testing it on
      - `adb install {downloaded-apk}`
      - Open the application. Ensure Home loads.
        - known issue: icons don't load in airplane mode
      - Disable airplane mode and test the application.

4. **Upload the application to backend for website and `expo-cli` to download**

    **Why:** So that developers who used `expo-cli` to download Expo Go to their devices can download the update.

    **How:**
    - Open GitHub Checks for the release branch and go to the `Android Client / build` workflow. Once it's finished, run `et wd client-android-simulator` and follow that workflow run which takes and uploads the client APK to staging.
    - Test if this APK works as expected. Connect Android device to your computer or open up an emulator and then run expotools command `et client-install -p android` to install and launch an APK.
    - When you're ready to sync the versions change to production, run `et promote-versions`.

5. **Submit the application to Play Store**

    **Why:** So that our users that downloaded Expo Go from Play Store can update easily.

    **How:** Run `et wd client-android-release` which releases the APK to Play Store. About 45 minutes later the update should be downloadable via Play Store.
