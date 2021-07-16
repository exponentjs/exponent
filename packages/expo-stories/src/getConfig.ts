import path from 'path';

import { defaultConfig } from './constants';
import { IServerConfig } from './types';

function getConfig(serverConfig: IServerConfig): IServerConfig {
  let config = {
    ...defaultConfig,
    ...serverConfig,
  };

  const pathToPackageJson = path.resolve(config.projectRoot, 'package.json');
  const packageJson = require(pathToPackageJson);
  const packageJsonConfig = packageJson.expoStories ?? {};

  config = {
    ...config,
    ...packageJsonConfig,
  };

  return config;
}

export { getConfig };
