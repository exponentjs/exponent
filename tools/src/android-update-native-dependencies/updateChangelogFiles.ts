import * as Changelogs from '../Changelogs';
import dependenciesChangelogs from './dependenciesChangelogs.json';
import { AndroidProjectDependenciesUpdates } from './types';

function maybeWrapInChangelogLink(string: string, dependencyName: string) {
  const changelog = dependenciesChangelogs[dependencyName];
  return changelog ? `[${string}](${changelog})` : string;
}

export async function addChangelogEntries(
  updatesList: AndroidProjectDependenciesUpdates[]
): Promise<void> {
  await Promise.all(
    updatesList
      .filter((update) => update.updates.length > 0)
      .filter((update) => update.report.changelogPath)
      .map(async ({ updates, report }) => {
        const changelog = Changelogs.loadFrom(report.changelogPath!);

        await changelog.insertEntriesAsync(
          Changelogs.UNPUBLISHED_VERSION_NAME,
          Changelogs.ChangeType.LIBRARY_UPGRADES,
          null,
          [
            `Updated Android native dependenc${updates.length > 1 ? 'ies' : 'y'}:${updates
              .map(
                (update) =>
                  `\n  - ${maybeWrapInChangelogLink(
                    `\`${update.fullName}:${update.oldVersion}\` ➡️ \`${update.newVersion}\``,
                    update.fullName
                  )}`
              )
              .join(',')}`,
          ]
        );

        await changelog.saveAsync();
      })
  );
}
