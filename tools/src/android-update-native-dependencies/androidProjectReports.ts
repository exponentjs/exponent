import chalk from 'chalk';
import { pathExists, readJSON, unlink, writeJSON } from 'fs-extra';
import glob from 'glob-promise';
import ora from 'ora';
import * as path from 'path';

import * as Directories from '../Directories';
import logger from '../Logger';
import { spawnAsync, SpawnResult } from '../Utils';
import {
  AndroidProjectReport,
  GradleDependency,
  RawGradleDependency,
  RawGradleReport,
} from './types';

export const REVISIONS = ['release', 'milestone', 'integration'] as const;

export type Revision = typeof REVISIONS[number];

export interface GradleTaskOptions {
  revision: Revision;
  clearCache: boolean;
}

function flatSingle<T>(arr: T[][]) {
  return ([] as T[]).concat(...arr);
}

function generateReportCacheFilePath(dateTimestamp: Date, gradleTaskOptions: GradleTaskOptions) {
  const date = `${dateTimestamp.getUTCFullYear()}.${dateTimestamp.getUTCMonth()}.${dateTimestamp.getUTCDate()}`;
  return `${Directories.getExpotoolsDir()}/cache/android-gradle-updatesReport.${
    gradleTaskOptions.revision
  }.${date}.cache.json`;
}

async function readCachedReports(reportFilename: string): Promise<AndroidProjectReport[] | null> {
  if (!(await pathExists(reportFilename))) {
    return null;
  }
  return readJSON(reportFilename);
}

async function cacheReports(reportFilename: string, reports: AndroidProjectReport[]) {
  await writeJSON(reportFilename, reports);
}

async function clearCachedReports(reportFilename: string) {
  if (await pathExists(reportFilename)) {
    await unlink(reportFilename);
  }
}

/**
 * Checks for gradle executable in provided android project directory.
 */
async function determineGradleWrapperCommand(androidProjectDir: string): Promise<string> {
  const gradleWrapperFilename = process.platform === 'win32' ? 'gradlew.bat' : 'gradlew';
  const gradleWrapperCommand = path.join(androidProjectDir, gradleWrapperFilename);
  if (!(await pathExists(gradleWrapperCommand))) {
    throw new Error(`Gradle ${gradleWrapperCommand} does not exist.`);
  }
  return gradleWrapperCommand;
}

/**
 * Executes `gradle dependencyUpdates` task that generates gradle dependencies updates report in
 * `build/dependencyUpdates.json` files.
 */
async function executeGradleTask(
  androidProjectDir: string,
  gradleTaskOptions: GradleTaskOptions
): Promise<SpawnResult> {
  const gradleWrapperCommand = await determineGradleWrapperCommand(androidProjectDir);
  const gradleCommandArguments = [
    'dependencyUpdates',
    '-DoutputFormatter=json',
    `-DoutputDir=build/dependencyUpdates`,
    `-Drevision=${gradleTaskOptions.revision}`,
  ];
  const spinner = ora({
    spinner: 'dots',
    text: `Executing gradle command ${chalk.yellow(
      `${gradleWrapperCommand} ${gradleCommandArguments.join(' ')}`
    )}. This might take a while.`,
  });

  spinner.start();
  const result = await spawnAsync(gradleWrapperCommand, gradleCommandArguments, {
    cwd: androidProjectDir,
  });
  spinner.succeed();
  if (result.status !== 0) {
    logger.error('Gradle process failed with an error.', result.stderr);
  }
  return result;
}

/**
 * Reads gradle reports and converts it into Android report
 */
async function readGradleReportAndConvertIntoAndroidReport(
  reportPath: string
): Promise<AndroidProjectReport> {
  const mapRawGradleDependency = ({
    group,
    name,
    available,
    version,
    projectUrl,
  }: RawGradleDependency): GradleDependency => ({
    group,
    name,
    fullName: `${group}:${name}`,
    availableVersion: available?.release ?? available?.milestone ?? available?.integration ?? null,
    currentVersion: version,
    projectUrl,
  });

  const findChangelogFilePath = async (reportPath: string): Promise<string | null> => {
    const changelogPath = path.resolve(reportPath, '../../../../CHANGELOG.md');
    if (!reportPath.includes('/packages/')) {
      return null;
    }
    if (!(await pathExists(changelogPath))) {
      return null;
    }
    return changelogPath;
  };

  const findGradleFilePath = async (reportPath: string): Promise<string> => {
    const gradleBuildGroovy = path.resolve(reportPath, '../../../build.gradle');
    const gradleBuildKotlin = path.resolve(reportPath, '../../../build.gradle.kts');
    if (await pathExists(gradleBuildGroovy)) {
      return gradleBuildGroovy;
    }
    if (await pathExists(gradleBuildKotlin)) {
      return gradleBuildKotlin;
    }
    throw new Error(`Failed to locate gradle.build(.kts)? for report: ${reportPath}`);
  };

  const rawGradleUpdatesReport = (await readJSON(reportPath)) as RawGradleReport;

  const gradleFilePath = await findGradleFilePath(reportPath);
  const projectPath = path.dirname(gradleFilePath).endsWith('android')
    ? path.resolve(path.dirname(gradleFilePath), '..')
    : path.dirname(gradleFilePath);
  const projectName = projectPath.includes('/packages/')
    ? path.relative(Directories.getPackagesDir(), projectPath)
    : path.relative(Directories.getExpoRepositoryRootDir(), projectPath);

  return {
    gradleReport: {
      current: rawGradleUpdatesReport.current.dependencies.map(mapRawGradleDependency),
      exceeded: rawGradleUpdatesReport.exceeded.dependencies.map(mapRawGradleDependency),
      unresolved: rawGradleUpdatesReport.unresolved.dependencies.map(mapRawGradleDependency),
      outdated: rawGradleUpdatesReport.outdated.dependencies.map(mapRawGradleDependency),
    },
    gradleFilePath,
    rawGradleReport: rawGradleUpdatesReport,
    projectPath,
    projectName,
    changelogPath: await findChangelogFilePath(reportPath),
  };
}

async function readAndConvertReports(): Promise<AndroidProjectReport[]> {
  const findGradleReportsFiles = async (cwd: string): Promise<string[]> => {
    const result = await glob('**/build/dependencyUpdates/report.json', {
      cwd,
      ignore: ['**/node_modules, **/ios'],
    });
    return Promise.all(result.map(async (el) => path.resolve(cwd, el)));
  };

  const gradleReportsPaths: string[] = flatSingle(
    await Promise.all(
      [
        Directories.getPackagesDir(),
        Directories.getAndroidDir(),
        path.join(Directories.getAppsDir(), 'bare-expo/android'),
      ].map(findGradleReportsFiles)
    )
  );

  const androidProjectUpdatesReport: AndroidProjectReport[] = await Promise.all(
    gradleReportsPaths.map(readGradleReportAndConvertIntoAndroidReport)
  );

  return androidProjectUpdatesReport.sort((a, b) => a.projectName.localeCompare(b.projectName));
}

/**
 * Gets Android project report by:
 * - running gradle task that generates json files describing gradle status unless
 * there's report available for a current day
 * - reading these json reports files and converting them into Android project report
 *
 * Date timestamping is used to prevent time-consuming gradle task reruns
 * and caching accumulated gradle reports in json file.
 */
export async function getAndroidProjectReports(
  options: GradleTaskOptions
): Promise<AndroidProjectReport[]> {
  const timestamp = new Date();
  const reportCacheFilePath = generateReportCacheFilePath(timestamp, options);

  if (options.clearCache) {
    await clearCachedReports(reportCacheFilePath);
    logger.log('\n🗑 Cleared cached gradle task reports.');
  }

  const cachedReports = await readCachedReports(reportCacheFilePath);
  if (cachedReports) {
    logger.info('📤 Using cached gradle updates reports.');
    return cachedReports;
  }

  for (const androidProjectPath of [
    Directories.getAndroidDir(),
    path.join(Directories.getAppsDir(), 'bare-expo/android'),
  ]) {
    await executeGradleTask(androidProjectPath, options);
  }

  const reports = await readAndConvertReports();

  await cacheReports(reportCacheFilePath, reports);
  return reports;
}
