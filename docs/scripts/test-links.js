const puppeteer = require('puppeteer');

const url = process.argv[2];
const externalLinks = [
  '/versions/latest/workflow/expo-cli/', // https://github.com/expo/expo-cli/blob/master/packages/expo-cli/README.md and https://github.com/expo/expo-cli/blob/master/README.md
  '/versions/latest/workflow/configuration/', // https://github.com/expo/expo-cli/blob/master/CONTRIBUTING.md and https://github.com/expo/expo-cli/blob/master/packages/expo-cli/src/commands/init.js and https://github.com/expo/expo-cli/blob/master/packages/xdl/src/project/Doctor.js
  // https://github.com/expo/expo-cli/blob/4e16a55e98e0612f71685ed16b3b5f8405219d4a/packages/xdl/README.md#xdl [Documentation](https://docs.expo.io/versions/devdocs/index.html)
  '/versions/latest/distribution/building-standalone-apps/#switch-to-push-notification-key-on-ios', // https://github.com/expo/expo-cli/blob/master/packages/expo-cli/src/commands/build/ios/credentials/constants.js
  '/versions/latest/distribution/building-standalone-apps/#2-configure-appjson', // https://github.com/expo/expo-cli/blob/master/packages/expo-cli/src/commands/build/AndroidBuilder.js
  '/versions/latest/distribution/building-standalone-apps/#if-you-choose-to-build-for-android', // https://github.com/expo/expo-cli/blob/master/packages/expo-cli/src/commands/build/AndroidBuilder.js
  '/versions/latest/distribution/uploading-apps/', // https://github.com/expo/expo-cli/blob/master/packages/expo-cli/src/commands/upload/BaseUploader.js
  '/versions/latest/workflow/linking/', // https://github.com/expo/expo-cli/blob/master/packages/xdl/src/detach/Detach.js
  '/versions/latest/workflow/configuration/#ios', // https://github.com/expo/expo-cli/blob/master/packages/xdl/src/detach/Detach.js
  '/versions/latest/guides/splash-screens/#differences-between-environments---android', // https://github.com/expo/expo-cli/blob/master/packages/xdl/src/Android.js
  '/versions/latest/sdk/overview/', // https://github.com/expo/expo-cli/blob/master/packages/xdl/src/project/Convert.js
  '/versions/latest/distribution/building-standalone-apps/#2-configure-appjson', // https://github.com/expo/expo-cli/blob/master/packages/expo-cli/src/commands/build/ios/IOSBuilder.js
  '/versions/latest/guides/configuring-ota-updates/', // https://github.com/expo/expo-cli/blob/master/packages/expo-cli/src/commands/build/BaseBuilder.js
  '/versions/latest/expokit/eject/', // https://github.com/expo/expo-cli/blob/master/packages/expo-cli/src/commands/eject/Eject.js
  '/versions/latest/introduction/faq/#can-i-use-nodejs-packages-with-expo', // https://github.com/expo/expo-cli/blob/master/packages/xdl/src/logs/PackagerLogsStream.js
  '/versions/latest/guides/offline-support/', // https://github.com/expo/expo-cli/tree/master/packages/xdl/caches
];

(async () => {
  const notFound = [];
  const redirectsFailed = [];

  const browser = await puppeteer.launch();
  for (const link of externalLinks) {
    const page = await browser.newPage();
    await page.goto(`${url}${link}`);

    if ((await page.$$('#__not_found')).length) {
      notFound.push(link);
    } else if ((await page.$$('#redirect-link')).length) {
      await page.click('#redirect-link');
      if ((await page.$$('#__redirect_failed')).length) {
        redirectsFailed.push(link);
      }

      if ((await page.$$('#__not_found')).length) {
        notFound.push(link);
      }
    }

    await page.close();
  }
  await browser.close();

  if (notFound.length || redirectsFailed.length) {
    if (notFound.length) {
      console.error(`Pages not found for links: ${notFound.join(',')}`);
    } else if (redirectsFailed.length) {
      console.error(`Redirects failed for links: ${redirectsFailed.join(',')}`);
    }
    process.exit(-1);
  }
})();
