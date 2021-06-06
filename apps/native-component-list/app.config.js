export default ({ config }) => {
  config.version = '41.0.0';
  // app.json defines the sdkVersion as UNVERSIONED, we can override it here dynamically if we need to,
  // for example with an environment variable.
  // config.sdkVersion = '41.0.0';
  if (!Array.isArray(config.plugins)) {
    config.plugins = [];
  }

  config.plugins.push(
    
    // iOS plugins
    // Add a plugin to modify the AppDelegate.
    './plugins/withNotFoundModule',
    // Add the React DevMenu back to the client.
    // './plugins/withDevMenu',
    // Add AsyncStorage
    './plugins/withExpoAsyncStorage',
    // Set the minimum version to 11 for Google Sign-In support -- TODO: Maybe this belongs in expo-google-sign-in?
    ['./plugins/withPodfileMinVersion', '11.0'],

    // Android plugins

    // unimodules-test-core requires kotlin, so additional setup must be executed.
    'unimodules-test-core',
    [
      './plugins/withGradleProperties',
      {
        // Increase default java VM size so it can handle building all the Expo packages.
        'org.gradle.jvmargs':
          '-Xmx3g -XX:MaxPermSize=2048m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8',
      },
    ],
    [
      // unimodules-test-core must be added manually.
      './plugins/withSettingsImport',
      {
        packageName: 'unimodules-test-core',
        packagePath: '../../../packages/unimodules-test-core/android',
      },
    ],
  );

  // NOTE(brentvatne):
  // This adds an ios.scheme property to manifest, which does not validate
  // against our schema but works with config plugins. Comment this plugin
  // out if you need to publish.
  //
  config.plugins.push([
    'expo-payments-stripe',
    {
      scheme: 'ncl-payments',
      merchantId: 'merchant.com.example.development',
    },
  ]);

  return config;
};
