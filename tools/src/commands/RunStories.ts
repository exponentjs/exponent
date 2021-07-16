import spawnAsync from '@expo/spawn-async';
import { IosPlist } from '@expo/xdl';
import fs from 'fs';
import path from 'path';

import { podInstallAsync } from '../CocoaPods';
import { runExpoCliAsync } from '../ExpoCLI';

type Action = {
  platform: 'android' | 'ios';
  name: string;
};

async function action({ platform, name }: Action) {
  const cwdPkg = require(path.resolve(process.cwd(), 'package.json'));
  const cwdPkgName = cwdPkg.name;

  if (cwdPkgName && cwdPkgName !== '@expo/expo') {
    name = cwdPkgName;
  }

  if (!name) {
    throw new Error('Need to specify a name or run this in a package repo');
  }

  // eslint-disable-next-line
  const examplesRoot = path.resolve(__dirname, '../../../story-loaders');

  if (!fs.existsSync(examplesRoot)) {
    fs.mkdirSync(examplesRoot);
  }

  const projectName = `${name}-stories`;
  const xcodeProjectName = projectName.split('-').join('');

  // TODO - flag to toggle this rebuild from scratch
  const projectRoot = path.resolve(examplesRoot, projectName);
  if (fs.existsSync(projectRoot)) {
    // @ts-ignore
    fs.rmdirSync(projectRoot, { recursive: true, force: true });
  }

  // 1. initialize expo project w/ name
  await runExpoCliAsync('init', [projectName, '-t', 'bare-minimum', '--no-install'], {
    cwd: examplesRoot,
  });

  // 2. run expo prebuild on project
  await runExpoCliAsync('prebuild', ['--no-install'], { cwd: projectRoot });

  // 3. copy over template files for project
  // eslint-disable-next-line
  const templateRoot = path.resolve(__dirname, '../../../template-files/stories-templates');

  // metro config
  const metroConfigPath = path.resolve(templateRoot, 'metro.config.js');
  fs.copyFileSync(metroConfigPath, path.resolve(projectRoot, 'metro.config.js'));

  // package.json
  // eslint-disable-next-line
  const packageRoot = path.resolve(__dirname, '../../../packages', name);
  const defaultPkg = require(path.resolve(templateRoot, 'pkg.json'));
  const projectPkg = require(path.resolve(projectRoot, 'package.json'));
  const packagePkg = require(path.resolve(packageRoot, 'package.json'));

  const mergedPkg = {
    ...projectPkg,
    ...defaultPkg,
  };

  // configure story server
  mergedPkg.expoStories = {
    projectRoot,
    watchRoot: packageRoot,
  };

  // add native modules by removing them from excluded autolinked packages
  const defaultPackagesToExclude = mergedPkg.expo.autolinking.exclude;
  const packagesRequiredByModule: string[] = packagePkg.expoStories?.packages || [];

  const packagesToExclude = defaultPackagesToExclude.filter(
    (pkg: string) => !packagesRequiredByModule.includes(pkg)
  );

  mergedPkg.expo.autolinking.exclude = packagesToExclude;

  // add any extra node modules required by the package (e.g stories components)
  const extraNodeModules = packagePkg.expoStories?.extraNodeModules || {};
  mergedPkg.dependencies = {
    ...mergedPkg.dependencies,
    ...extraNodeModules,
  };

  fs.writeFileSync(
    path.resolve(projectRoot, 'package.json'),
    JSON.stringify(mergedPkg, null, '\t')
  );

  // AppDelegate.{h,m}
  const iosRoot = path.resolve(projectRoot, 'ios', xcodeProjectName);

  fs.copyFileSync(
    path.resolve(templateRoot, 'ios/AppDelegate.h'),
    path.resolve(iosRoot, 'AppDelegate.h')
  );

  fs.copyFileSync(
    path.resolve(templateRoot, 'ios/AppDelegate.m'),
    path.resolve(iosRoot, 'AppDelegate.m')
  );

  // Podfile
  const podfileRoot = path.resolve(projectRoot, 'ios/Podfile');

  fs.copyFileSync(path.resolve(templateRoot, 'ios/Podfile'), podfileRoot);

  // update target
  let podFileStr = fs.readFileSync(podfileRoot, { encoding: 'utf-8' });
  podFileStr = podFileStr.replace('{{ targetName }}', xcodeProjectName);

  fs.writeFileSync(path.resolve(projectRoot, 'ios/Podfile'), podFileStr, { encoding: 'utf-8' });

  // Info.plist -> add splash screen
  IosPlist.modifyAsync(iosRoot, 'Info', (config) => {
    config['UILaunchStoryboardName'] = 'SplashScreen';
    return config;
  });

  // .watchmanconfig
  fs.writeFileSync(path.resolve(projectRoot, '.watchmanconfig'), '{}', { encoding: 'utf-8' });
  fs.copyFileSync(path.resolve(templateRoot, 'App.js'), path.resolve(projectRoot, 'App.js'));

  // 4. yarn + install deps
  console.log('🧶 Yarning...');
  await spawnAsync('yarn', ['install'], { cwd: projectRoot });

  console.log('☕️ Podding...');
  await podInstallAsync(path.resolve(projectRoot, 'ios'));

  console.log('Done!');
  console.log(`Navigate to ${examplesRoot}/${projectName}!`);

  // remove .git directory - seems to help with watchman and fast refresh??
  // figure this one out - doesnt seem to help
  // @ts-ignore
  // fs.rmdirSync(path.resolve(projectRoot, '.git'), { force: true, recursive: true });
}

export default (program: any) => {
  program
    .command('run-stories')
    // .option('-p, --platform <string>', 'Determine for which platform we should run')
    .option('-n, --name <string>', 'The name of the package')
    .asyncAction(action);
};
