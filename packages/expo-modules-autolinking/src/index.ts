import commander from 'commander';

import {
  findModulesAsync,
  resolveModulesAsync,
  verifySearchResults,
  generatePackageListAsync,
  mergeLinkingOptionsAsync,
} from './autolinking';
import { GenerateOptions, ResolveOptions, SearchOptions, SearchResults } from './types';

/**
 * Registers a command that only searches for available expo modules.
 */
function registerSearchCommand<OptionsType extends SearchOptions>(
  commandName: string,
  fn: (search: SearchResults, options: OptionsType) => any
) {
  return commander
    .command(`${commandName} [paths...]`)
    .option<string[] | null>(
      '-i, --ignore-paths <ignorePaths...>',
      'Paths to ignore when looking up for modules.',
      (value, previous) => (previous ?? []).concat(value)
    )
    .option<string[] | null>(
      '-e, --exclude <exclude...>',
      'Package names to exclude when looking up for modules.',
      (value, previous) => (previous ?? []).concat(value)
    )
    .option(
      '-p, --platform [platform]',
      'The platform that the resulted modules must support. Available options: "ios", "android"',
      'ios'
    )
    .action(async (searchPaths, providedOptions) => {
      const options = await mergeLinkingOptionsAsync<OptionsType>({
        ...providedOptions,
        searchPaths,
      });
      const searchResults = await findModulesAsync(options);
      return await fn(searchResults, options);
    });
}

/**
 * Registers a command that searches for modules and then resolves them for specific platform.
 */
function registerResolveCommand<OptionsType extends ResolveOptions>(
  commandName: string,
  fn: (search: SearchResults, options: OptionsType) => any
) {
  return registerSearchCommand<OptionsType>(commandName, fn);
}

module.exports = async function(args: string[]) {
  // Searches for available expo modules.
  registerSearchCommand('search', async results => {
    console.log(require('util').inspect(results, false, null, true));
  });

  // Checks whether there are no resolving issues in the current setup.
  registerSearchCommand('verify', results => {
    const numberOfDuplicates = verifySearchResults(results);
    if (!numberOfDuplicates) {
      console.log('✅ Everything is fine!');
    }
  });

  // Searches for available expo modules and resolves the results for given platform.
  registerResolveCommand('resolve', async (results, options) => {
    const modules = await resolveModulesAsync(results, options);

    if (options.json) {
      console.log(JSON.stringify({ modules }));
    } else {
      console.log({ modules });
    }
  }).option<boolean>('-j, --json', 'Output results in the plain JSON format.', () => true, false);

  // Generates a source file listing all packages to link.
  registerResolveCommand<GenerateOptions>('generate-package-list', async (results, options) => {
    const modules = options.empty ? [] : await resolveModulesAsync(results, options);
    generatePackageListAsync(modules, options);
  })
    .option(
      '-t, --target <path>',
      'Path to the target file, where the package list should be written to.'
    )
    .option(
      '-n, --namespace <namespace>',
      'Java package name under which the package list should be placed.'
    )
    .option(
      '--empty',
      'Whether to only generate an empty list. Might be used when the user opts-out of autolinking.',
      false
    );

  await commander
    .version(require('expo-modules-autolinking/package.json').version)
    .description('CLI command that searches for Expo modules to autolink them.')
    .parseAsync(args, { from: 'user' });
};
