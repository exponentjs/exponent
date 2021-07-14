import { Command } from '@expo/commander';
import chalk from 'chalk';
import { Application, TSConfigReader, TypeDocReader } from 'typedoc';
import fs from 'fs-extra';
import path from 'path';
import recursiveOmitBy from 'recursive-omit-by';

import { EXPO_DIR, PACKAGES_DIR } from '../Constants';
import logger from '../Logger';

type ActionOptions = {
  packageName?: string;
  version?: string;
};

type EntryPoint = string | string[];

type CommandAdditionalParams = [
  entryPoint: EntryPoint,
  packageName?: string
];

const MINIFY_JSON = true;

const executeCommand = async (
  jsonFileName: string,
  version: string,
  entryPoint: EntryPoint = 'index.ts',
  packageName: string = jsonFileName
) => {
  const app = new Application();

  app.options.addReader(new TSConfigReader());
  app.options.addReader(new TypeDocReader());

  const dataPath = path.join(EXPO_DIR, 'docs', 'public', 'static', 'data', version);
  const basePath = path.join(PACKAGES_DIR, packageName);
  const entriesPath = path.join(basePath, 'src');
  const tsConfigPath = path.join(basePath, 'tsconfig.json');
  const jsonOutputPath = path.join(dataPath, `${jsonFileName}.json`);

  const entryPoints = Array.isArray(entryPoint) ? (
    entryPoint.map(entry => path.join(entriesPath, entry))
  ) : (
    [path.join(entriesPath, entryPoint)]
  );

  app.bootstrap({
    entryPoints,
    tsconfig: tsConfigPath,
    disableSources: true,
    hideGenerator: true,
    excludePrivate: true,
    excludeProtected: true,
  });

  const project = app.convert();

  if (project) {
    await app.generateJson(project, jsonOutputPath);
    const output = await fs.readJson(jsonOutputPath);
    output.name = jsonFileName;

    if (Array.isArray(entryPoint)) {
      const filterEntries = entryPoint.map(entry => entry.substring(0, entry.lastIndexOf('.')));
      output.children = output.children
        .filter(entry => filterEntries.includes(entry.name))
        .map(entry => entry.children)
        .flat()
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    if (MINIFY_JSON) {
      const minifiedJson = recursiveOmitBy(output, ({key, node}) =>
        key === 'id' ||
        key === 'groups' ||
        (key === 'flags' && !Object.keys(node).length)
      );
      await fs.writeFile(jsonOutputPath, JSON.stringify(minifiedJson, null, 0));
    } else {
      await fs.writeFile(jsonOutputPath, JSON.stringify(output));
    }
  } else {
    throw new Error(`💥 Failed to extract API data from source code for '${packageName}' package.`);
  }
};

async function action({packageName, version = 'unversioned'}: ActionOptions) {
  const packagesMapping: Record<string, CommandAdditionalParams> = {
    'expo-analytics-segment': ['Segment.ts'],
    'expo-app-loading': ['index.ts'],
    'expo-apple-authentication': [['AppleAuthentication.ts', 'AppleAuthentication.types.ts']],
    'expo-application': ['Application.ts'],
    'expo-background-fetch': ['BackgroundFetch.ts'],
    'expo-battery': ['Battery.ts'],
    'expo-blur': ['index.ts'],
    'expo-cellular': ['Cellular.ts'],
    'expo-clipboard': ['Clipboard.ts'],
    'expo-haptics': ['Haptics.ts'],
    'expo-keep-awake': ['index.ts'],
    'expo-linear-gradient': ['LinearGradient.tsx'],
    'expo-localization': ['Localization.ts'],
    'expo-location': ['Location.ts'],
    'expo-mail-composer': ['MailComposer.ts'],
    'expo-network': ['Network.ts'],
    'expo-pedometer': ['Pedometer.ts', 'expo-sensors'],
    'expo-print': ['Print.ts'],
    'expo-random': ['Random.ts'],
    'expo-secure-store': ['SecureStore.ts'],
    'expo-sharing': ['Sharing.ts'],
    'expo-speech': ['Speech/Speech.ts'],
    'expo-screen-capture': ['ScreenCapture.ts'],
    'expo-splash-screen': ['SplashScreen.ts'],
    'expo-sms': ['SMS.ts'],
    'expo-store-review': ['StoreReview.ts'],
    'expo-task-manager': ['TaskManager.ts'],
    'expo-tracking-transparency': ['TrackingTransparency.ts'],
    'expo-video-thumbnails': ['VideoThumbnails.ts'],
    'expo-web-browser': ['WebBrowser.ts'],
  };

  try {
    if (packageName) {
      const packagesEntries = Object.entries(packagesMapping)
        .filter(([key, value]) => key == packageName || value.includes(packageName))
        .map(([key, value]) => executeCommand(key, version, ...value));
      if (packagesEntries.length) {
        await Promise.all(packagesEntries);
        logger.log(chalk.green(`\n🎉 Successful extraction of docs API data for the selected package!`));
      } else {
        logger.warn(`🚨 Package '${packageName}' API data generation is not supported yet!`);
      }
    } else {
      const packagesEntries = Object.entries(packagesMapping)
        .map(([key, value]) => executeCommand(key, version, ...value));
      await Promise.all(packagesEntries);
      logger.log(chalk.green(`\n🎉 Successful extraction of docs API data for all available packages!`));
    }
  } catch (error) {
    logger.error(error);
  }
}

export default (program: Command) => {
  program
    .command('generate-docs-api-data')
    .alias('gdad')
    .description(`Extract API data JSON files for docs using TypeDoc.`)
    .option('-p, --packageName <packageName>', 'Extract API data only for the specific package.')
    .option('-v, --version <version>', 'Set the data output path to the specific version.', 'unversioned')
    .asyncAction(action);
};
