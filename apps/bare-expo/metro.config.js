const { createMetroConfiguration } = require('expo-yarn-workspaces');

const baseConfig = createMetroConfiguration(__dirname);

const assetsLocationsRewrites = {
  // @react-navigation/stack is hoisted to root node_modules
  '/node_modules/@react-navigation/stack': '../../node_modules/@react-navigation/stack',
  // native-component-list is one level up from bare-expo
  '/native-component-list': '../native-component-list',
};

module.exports = {
  ...baseConfig,

  // NOTE(brentvatne): This can be removed when
  // https://github.com/facebook/metro/issues/290 is fixed.
  server: {
    enhanceMiddleware: middleware => {
      return (req, res, next) => {
        // When an asset is imported outside the project root, it has wrong path on Android
        // This happens for the back button in stack, so we fix the path to correct one
        let assetLocationAlreadyRewritten = false;
        const originalUrl = req.url;
        for (const [rewriteFrom, rewriteTo] of Object.entries(assetsLocationsRewrites)) {
          // While most probably this will never happen, let's guard against it and inform
          // the developer of any unexpected behavior.
          if (assetLocationAlreadyRewritten) {
            console.warn(
              `Multiple asset location rewrites matched "${originalUrl}". Applying only the first matching rule.`
            );
            break;
          }

          if (req.url.startsWith(rewriteFrom)) {
            req.url = req.url.replace(rewriteFrom, `/assets/${rewriteTo}`);
            assetLocationAlreadyRewritten = true;
          }
        }

        // Same as above when testing anything required via Asset.downloadAsync() in test-suite
        const testSuiteAssets = '/test-suite/assets/';

        if (req.url.startsWith(testSuiteAssets)) {
          req.url = req.url.replace(testSuiteAssets, '/assets/../test-suite/assets/');
        }

        const nclAssets = '/native-component-list/';

        if (req.url.startsWith(nclAssets)) {
          req.url = req.url.replace(nclAssets, '/assets/../native-component-list/');
        }

        return middleware(req, res, next);
      };
    },
  },
};
