---
title: Android Studio Emulator
---

import ImageSpotlight from '~/components/plugins/ImageSpotlight'

If you don't have an Android device available to test with, we recommend using the default emulator that comes with Android Studio. If you run into any problems setting it up, follow the steps in this guide.

## Step 1: Set up Android Studio's tools

- [Download](https://developer.android.com/studio) and install Android Studio 3.0+.

- Select "Standard" for the "Install Type" inside the wizard.

- Inside Android Studio, go to Preferences > Appearance & Behavior > System Settings > Android SDK. Click on the "SDK Tools" tab and make sure you have at least one version of the "Android SDK Build-Tools" installed.

<ImageSpotlight alt="Android SDK build tools" src="/static/images/android-studio-build-tools.png" containerStyle={{ paddingBottom: 0 }} />

- Copy or remember the path listed in the box that says "Android SDK Location."

<ImageSpotlight alt="Android SDK location" src="/static/images/android-studio-sdk-location.png" containerStyle={{ paddingBottom: 0 }} />

- If you are on macOS or Linux, add an environment variable pointing to the Android SDK location in `~/.bash_profile` (or `~/.zshenv` if you use Zsh) - eg. `export ANDROID_SDK=/your/path/here`. Copy and paste these two lines to do this automatically for Bash and Zsh:

```bash
[ -d "$HOME/Library/Android/sdk" ] && ANDROID_SDK=$HOME/Library/Android/sdk || ANDROID_SDK=$HOME/Android/Sdk
echo "export ANDROID_SDK=$ANDROID_SDK" >> ~/`[[ $SHELL == *"zsh" ]] && echo '.zshenv' || echo '.bash_profile'`
```

- On macOS, you will also need to add `platform-tools` to your `~/.bash_profile` (or `~/.zshenv` if you use Zsh) - eg. `export PATH=/your/path/here:$PATH`. Copy and paste this line to do this automatically for Bash and Zsh:

```bash
echo "export PATH=$HOME/Library/Android/sdk/platform-tools:\$PATH" >> ~/`[[ $SHELL == *"zsh" ]] && echo '.zshenv' || echo '.bash_profile'`
```

- Make sure that you can run `adb` from your terminal.

## Step 2: Set up a virtual device

- On the Android Studio main screen, click "Configure", then "AVD Manager" in the dropdown.

<ImageSpotlight alt="Android Studio configure" src="/static/images/android-studio-configure.png" containerStyle={{ paddingBottom: 0 }} />

- Press the "+ Create Virtual Device" button.

<ImageSpotlight alt="Android Studio create virtual device" src="/static/images/android-studio-avd-manager.png" containerStyle={{ paddingBottom: 0 }} />

- Choose the type of hardware you'd like to emulate. We recommend testing against a variety of devices, but if you're unsure where to start, the newest device in the Pixel line could be a good choice.

- Select an OS version to load on the emulator (probably one of the system images in the "Recommended" tab), and download the image.

- Change any other settings you'd like, and press "Finish" to create the virtual device. You can now run this device anytime by pressing the Play button in the AVD Manager window.

#### Multiple `adb` versions

Having multiple `adb` versions on your system can result in the error `adb server version (xx) doesn't match this client (xx); killing...`

This is because the adb version on your system is different from the adb version on the android sdk platform-tools.

- Open the terminal and check the `adb` version on the system:
```sh
adb version
```

- And from the Android SDK platform-tool directory:
```sh
$ANDROID_SDK/platform-tools/adb version
```

- Create a symbolic link for `adb` from the Android SDK directory to `usr/local/bin`:
```sh
sudo ln -s $ANDROID_SDK/platform-tools/adb /usr/local/bin/adb
```
