import { Command } from '@expo/commander';

import androidUpdateNativeDependencies, { Options } from '../android-update-native-dependencies';
import { REVISIONS } from '../android-update-native-dependencies/androidProjectReports';

function validateOptions(options: Options) {
  if (!REVISIONS.includes(options.revision)) {
    throw new Error(`--revision must be one of ${REVISIONS.join(', ')}`);
  }
}

async function asyncAction(options: Options): Promise<void> {
  validateOptions(options);
  await androidUpdateNativeDependencies(options);
}

export default (program: Command) => {
  program
    .command('android-update-native-dependencies')
    .option(
      '-r, --revision <release>',
      `The revision controls the Ivy resolution strategy for determining what constitutes the latest version of a native dependency. See https://github.com/ben-manes/gradle-versions-plugin#revisions for more. Available values are: ${REVISIONS.join(
        ', '
      )}`,
      'release'
    )
    .option('-l, --list', 'List all available native dependencies updates.', false)
    .option(
      '-c, --clear-cache',
      'By default gradle task results are cached using date-based cache. You can use this flag to clear this cache.',
      false
    )
    .description(
      'Updates Android native dependencies in all projects/packages. This command bases heavily on results produced by https://github.com/ben-manes/gradle-versions-plugin.'
    )
    .asyncAction(asyncAction);
};
