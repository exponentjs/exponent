const path = require('path');

const { storiesFileDir } = require('./build/constants');
const { writeRequiredFiles } = require('./build/writeRequiredFiles');

function withExpoStories(metroConfig) {
  writeRequiredFiles({
    projectRoot: metroConfig.projectRoot,
  });

  metroConfig.resolver.extraNodeModules['generated-expo-stories'] = path.resolve(
    metroConfig.projectRoot,
    `${storiesFileDir}/stories.js`
  );

  metroConfig.watchFolders.push(path.resolve(metroConfig.projectRoot, storiesFileDir));

  return metroConfig;
}

module.exports = withExpoStories;
