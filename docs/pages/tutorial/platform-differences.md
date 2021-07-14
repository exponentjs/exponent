---
title: Handling platform differences
---

import SnackInline from '~/components/plugins/SnackInline';
import Video from '~/components/plugins/Video'

In the perfect world we want to write code to perform our task just once and have it run the same on every platform. Even on the web, where this is an explicit design goal, it's often necessary to consider differences between web browsers.

Expo tools try to handle smoothing over these differences between iOS, Android, web (and different web browsers) for you, but it isn't always possible. There are two important differences between how the iOS and Android share APIs work and how the Web Share API works.

1. It isn't always available on web.
2. We can't share local file URIs on web.

> 🤥 It's actually technically possible in the latest versions of Chrome for Android to share files, but it's very new and not yet supported by `expo-sharing`, so we will ignore that here for now.

## A workaround for sharing on web

We are going to work around spotty support for the Web Share API and the lack of support for sharing files from our device by uploading the file to some web service and then letting the users copy the URL.

Run `expo install anonymous-files` to install a library to handle uploading the file for us, then make these changes to your app:

<SnackInline label="Sharing web workaround" templateId="tutorial/sharing-web-workaround" dependencies={['expo-image-picker', 'expo-sharing', 'anonymous-files']} defaultPlatform="web">

<!-- prettier-ignore -->
```js
import React from 'react';
import { Image, /* @info Import Platform, you can order imports however you like, here we did it alphabetically. */Platform,/* @end */ StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
/* @info Import our newly installed package, it exports a function called uploadToAnonymousFilesAsync */
import uploadToAnonymousFilesAsync from 'anonymous-files'; /* @end */


export default function App() {
  const [selectedImage, setSelectedImage] = React.useState(null);

  let openImagePickerAsync = async () => {
    let permissionResult = await ImagePicker.requestCameraRollPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync();
    if (pickerResult.cancelled === true) {
      return;
    }

    /* @info When the platform OS (operating system) is web, upload the file and set the remoteUri */
    if (Platform.OS === 'web') {
      let remoteUri = await uploadToAnonymousFilesAsync(pickerResult.uri);
      setSelectedImage({ localUri: pickerResult.uri, remoteUri });
    } else {
      setSelectedImage({ localUri: pickerResult.uri, remoteUri: null });
    } /* @end */

  };

  let openShareDialogAsync = async () => {
    if (!(await Sharing.isAvailableAsync())) {
      /* @info Give the user a link to the website that the file is uploaded to */
      alert(`The image is available for sharing at: ${selectedImage.remoteUri}`);/* @end */

      return;
    }

    /* @info When the platform OS (operating system) is web, provide the remoteUri */
    if (Platform.OS === 'web') {
      Sharing.shareAsync(selectedImage.remoteUri);/
    } else {
      Sharing.shareAsync(selectedImage.localUri);/
    } /* @end */


  };

  /* the rest of the app is unchanged */
}
```

</SnackInline>

## Up next

Our app does everything we set out for it to do, so it's time to shift our focus towards the purely aesthetic. In the next step of this tutorial we will [customize our app icon and splash screen](../tutorial/configuration.md).
