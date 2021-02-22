import chalk from 'chalk';
import { readFile, writeFile } from 'fs-extra';
import * as path from 'path';
import terminalLink from 'terminal-link';

import * as Directories from '../Directories';
import logger from '../Logger';
import { AndroidProjectDependenciesUpdates } from './types';
import { addColorBasedOnSemverDiff, calculateSemverDiff } from './utils';

function replaceVersionInGradleFile(
  body: string,
  {
    oldVersion,
    newVersion,
    fullName,
    group,
    name,
  }: {
    oldVersion: string;
    newVersion: string;
    fullName: string;
    name: string;
    group: string;
  }
): string {
  let modifiedBody = body;

  const regexVersionVariable = new RegExp(`${fullName}:\\\${?(\\w+)}?`, 'ig');

  // 'de.kevcodez:pubg-api-wrapper:$myVar'
  // 'de.kevcodez:pubg-api-wrapper:${myVar}'
  const versionWithVariableMatches = regexVersionVariable.exec(modifiedBody);
  if (versionWithVariableMatches?.length === 2) {
    const variableName = versionWithVariableMatches[1];

    const regexVariableDefinition = new RegExp(
      `(${variableName}(\\s+)?=(\\s+)?('|")${oldVersion}('|"))`,
      'ig'
    );

    regexVariableDefinition
      .exec(modifiedBody)
      ?.filter((it) => it.includes(oldVersion))
      .forEach((match) => {
        modifiedBody = modifiedBody.replace(match, match.replace(oldVersion, newVersion));
      });

    // val PUBG_API_WRAPPER by extra("0.8.1")
    // eslint-disable-next-line no-useless-escape
    const regexKotlinValExtra = new RegExp(`${variableName}.+\(("|')${oldVersion}("|')\)`);
    regexKotlinValExtra
      .exec(modifiedBody)
      ?.filter((it) => it.includes(oldVersion))
      .forEach((match) => {
        modifiedBody = modifiedBody.replace(match, match.replace(oldVersion, newVersion));
      });
  }

  // compile 'de.kevcodez:pubg-api-wrapper:1.0.0'
  const regexVersionInline = new RegExp(`${fullName}:${oldVersion}`, 'g');
  regexVersionInline
    .exec(modifiedBody)
    ?.filter((it) => it.includes(`${fullName}:${oldVersion}`))
    .forEach((match) => {
      modifiedBody = modifiedBody.replace(match, `${fullName}:${newVersion}`);
    });

  // id 'com.github.ben-manes.versions' version "0.21.0"
  // id("com.github.ben-manes.versions") version "0.22.0"
  const regexPluginVersionWithPrefix = new RegExp(
    `${group}("|')\\)?(\\s+)?version(\\s+)?("|')${oldVersion}("|')`
  );
  regexPluginVersionWithPrefix
    .exec(modifiedBody)
    ?.filter((it) => it.includes(oldVersion)) // filter out all groups not containing version
    .forEach((match) => {
      modifiedBody = modifiedBody.replace(match, match.replace(oldVersion, newVersion));
    });

  // compile group: 'de.kevcodez.pubg', name: 'pubg-api-wrapper', version: '0.8.1'
  const regexDependencyWithVersionPrefix = new RegExp(
    `${name}('|"),(\\s+)?version:(\\s+)('|")${oldVersion}('|")`
  );
  regexDependencyWithVersionPrefix
    .exec(modifiedBody)
    ?.filter((it) => it.includes(oldVersion))
    .forEach((match) => {
      modifiedBody = modifiedBody.replace(match, match.replace(oldVersion, newVersion));
    });

  return modifiedBody;
}

async function readGradleFiles(
  updates: AndroidProjectDependenciesUpdates[]
): Promise<Record<string, string>> {
  const buildFiles = (
    await Promise.all(
      updates.map(async ({ report: { gradleFilePath } }) => [
        gradleFilePath,
        await readFile(gradleFilePath, 'utf-8'),
      ])
    )
  ).reduce<Record<string, string>>((acc, [filePath, content]) => {
    acc[filePath] = content;
    return acc;
  }, {});

  return buildFiles;
}

async function writeGradleFiles(gradleFiles: Record<string, string>) {
  await Promise.all(
    Object.entries(gradleFiles).map(
      async ([filePath, content]) => await writeFile(filePath, content)
    )
  );
}

export async function updateGradleDependencies(
  updatesList: AndroidProjectDependenciesUpdates[]
): Promise<void> {
  logger.log(chalk.white.bold(`\nUpdating gradle files.`));
  const buildFiles = await readGradleFiles(updatesList);
  for (const updates of updatesList) {
    if (updates.updates.length === 0) {
      continue;
    }

    logger.log(
      `\n📈 updating ${chalk.blue(
        updates.report.projectName
      )} native dependencies in file: ${terminalLink(
        chalk.italic.grey(
          path.relative(Directories.getExpoRepositoryRootDir(), updates.report.gradleFilePath)
        ),
        updates.report.gradleFilePath
      )}`
    );

    let buildFile = buildFiles[updates.report.gradleFilePath];
    for (const singleUpdate of updates.updates) {
      logger.log(
        `  ▶︎ ${chalk.blueBright(singleUpdate.fullName)}:${
          singleUpdate.oldVersion
        } ➡️  ${addColorBasedOnSemverDiff(
          singleUpdate.newVersion,
          calculateSemverDiff(singleUpdate.oldVersion, singleUpdate.newVersion)
        )}`
      );
      buildFile = replaceVersionInGradleFile(buildFile, singleUpdate);
    }
    buildFiles[updates.report.gradleFilePath] = buildFile;
  }

  await writeGradleFiles(buildFiles);
}
