'use strict';

const debug = require('debug')('workspaces');
const findYarnWorkspaceRoot = require('find-yarn-workspace-root');
const fs = require('fs');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const { assetExts } = require('metro-config/src/defaults/defaults');
const path = require('path');

/**
 * Returns a configuration object in the format expected for "metro.config.js" files. The
 * configuration:
 *
 *   * includes the Yarn workspace root in Metro's list of root directories
 *   * resolves symlinked packages, namely workspaces
 *   * excludes all modules from Haste's module system (providesModule)
 *   * excludes modules in the native Android and Xcode projects
 */
exports.createMetroConfiguration = function createMetroConfiguration(projectPath) {
  projectPath = path.resolve(projectPath);
  debug(`Creating a Metro configuration for the project at %s`, projectPath);

  let watchFolders;
  let extraNodeModules;

  let workspaceRootPath = findYarnWorkspaceRoot(projectPath);
  if (workspaceRootPath) {
    debug(`Found Yarn workspace root at %s`, workspaceRootPath);
    watchFolders = [workspaceRootPath];
    extraNodeModules = {
      ...getSymlinkedNodeModulesForDirectory(workspaceRootPath),
      ...getSymlinkedNodeModulesForDirectory(projectPath),
    };
  } else {
    debug(`Could not find Yarn workspace root`);
    watchFolders = [];
    extraNodeModules = getSymlinkedNodeModulesForDirectory(projectPath);
  }

  return {
    // Search for modules from the project's root directory
    projectRoot: projectPath,

    // Include npm packages from the workspace root, where packages are hoisted
    watchFolders,

    resolver: {
      // test-suite includes a db asset
      assetExts: [...assetExts, 'db'],

      // Make the symlinked packages visible to Metro
      extraNodeModules,

      // Use Node-style module resolution instead of Haste everywhere
      providesModuleNodeModules: [],

      // Ignore JS files in the native Android and Xcode projects
      blacklistRE: exclusionList([
        /.*\/android\/React(Android|Common)\/.*/,
        /.*\/versioned-react-native\/.*/,
      ]),
    },

    transformer: {
      // Ignore file-relative Babel configurations and apply only the project's
      enableBabelRCLookup: false,

      // Temporarily include the Expo asset plugin; figure out a more general way to include it
      assetPlugins: ['expo/tools/hashAssetFiles'],
    },
  };
};

/**
 * Returns a mapping from the names of symlinked packages to the physical paths of each package.
 */
function getSymlinkedNodeModulesForDirectory(packagePath) {
  let nodeModulesPath = path.join(packagePath, 'node_modules');
  let directories = listDirectoryContents(nodeModulesPath);

  let modules = {};
  for (let directory of directories) {
    // The directory is either a scope or a package
    if (directory.startsWith('@')) {
      let scopePath = path.join(nodeModulesPath, directory);
      let scopedPackageDirectories = fs.readdirSync(scopePath);
      for (let subdirectory of scopedPackageDirectories) {
        let dependencyName = `${directory}/${subdirectory}`;
        let dependencyPath = path.join(scopePath, subdirectory);
        if (fs.lstatSync(dependencyPath).isSymbolicLink()) {
          modules[dependencyName] = fs.realpathSync(dependencyPath);
        }
      }
    } else {
      let dependencyName = directory;
      let dependencyPath = path.join(nodeModulesPath, directory);
      if (fs.lstatSync(dependencyPath).isSymbolicLink()) {
        modules[dependencyName] = fs.realpathSync(dependencyPath);
      }
    }
  }
  return modules;
}

function listDirectoryContents(directory) {
  try {
    return fs.readdirSync(directory);
  } catch (e) {
    if (e.code === 'ENOENT') {
      return [];
    }
    throw e;
  }
}
