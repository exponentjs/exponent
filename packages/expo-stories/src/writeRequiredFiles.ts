import fs from 'fs';
import path from 'path';

import { storiesFileDir } from './constants';
import { getConfig } from './getConfig';
import { IServerConfig } from './types';

function writeRequiredFiles(serverConfig: IServerConfig) {
  const config = getConfig(serverConfig);

  const { projectRoot, watchRoot, port } = config;

  const pathToStories = path.resolve(projectRoot, storiesFileDir);

  if (!fs.existsSync(pathToStories)) {
    fs.mkdirSync(pathToStories, { recursive: true });
  }

  const pathToStoryFile = path.resolve(pathToStories, 'stories.js');

  if (!fs.existsSync(pathToStoryFile)) {
    fs.writeFileSync(pathToStoryFile, 'module.exports = {}', {
      encoding: 'utf-8',
    });
  }

  const pathToStoryManifest = path.resolve(pathToStories, 'storyManifest.json');

  if (fs.existsSync(pathToStoryManifest)) {
    const storyManifest = require(pathToStoryManifest);

    if (storyManifest.watchRoot !== watchRoot || storyManifest.projectRoot !== projectRoot) {
      fs.unlinkSync(pathToStoryManifest);
    }
  }

  if (!fs.existsSync(pathToStoryManifest)) {
    const emptyManifest = {
      watchRoot,
      port,
      projectRoot,
      files: {},
    };

    const emptyManifestAsString = JSON.stringify(emptyManifest, null, '\t');

    delete require.cache[pathToStoryManifest];

    fs.writeFileSync(pathToStoryManifest, emptyManifestAsString, {
      encoding: 'utf-8',
    });
  }
}

export { writeRequiredFiles };
