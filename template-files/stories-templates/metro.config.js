const withExpoStories = require('expo-stories/metro-config');
const { createMetroConfiguration } = require('expo-yarn-workspaces');

const defaultConfig = createMetroConfiguration(__dirname);

module.exports = withExpoStories(defaultConfig);
