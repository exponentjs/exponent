import { IServerConfig } from './types';

export const storiesFileDir = '__generated__/stories';

export const defaultConfig: IServerConfig = {
  projectRoot: process.cwd(),
  watchRoot: process.cwd(),
  // eslint-disable-next-line
  port: parseInt(process.env.PORT ?? '7001'),
};
