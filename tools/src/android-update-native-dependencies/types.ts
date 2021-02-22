export interface RawGradleVersion {
  version: string;
  reason: string;
  isUpdateAvailable: boolean;
  isFailure: boolean;
}

export interface RawGradleDependency {
  group: string;
  available?: {
    release: string | null;
    milestone: string | null;
    integration: string | null;
  };
  version: string;
  projectUrl: string | null;
  name: string;
}

export interface RawGradleDependencyGroup {
  dependencies: RawGradleDependency[];
  count: number;
}

export interface RawGradleReport {
  gradle: {
    enabled: true;
    current: RawGradleVersion;
    nightly: RawGradleVersion;
    releaseCandidate: RawGradleVersion;
    running: RawGradleVersion;
  };
  current: RawGradleDependencyGroup;
  exceeded: RawGradleDependencyGroup;
  outdated: RawGradleDependencyGroup;
  unresolved: RawGradleDependencyGroup;
  count: number;
}

export interface GradleDependency {
  group: string;
  name: string;
  /**
   * string of format: `${group}:${name}`
   */
  fullName: string;
  availableVersion: string | null;
  currentVersion: string;
  projectUrl: string | null;
}

export interface GradleReport {
  current: GradleDependency[];
  exceeded: GradleDependency[];
  outdated: GradleDependency[];
  unresolved: GradleDependency[];
}

/**
 * Main description of the android project and it's gradle dependencies.
 */
export interface AndroidProjectReport {
  gradleReport: GradleReport;
  rawGradleReport: RawGradleReport;
  projectName: string;
  projectPath: string;
  /**
   * Available only for Android projects in `packages/*` directory.
   */
  changelogPath: string | null;
  gradleFilePath: string;
}

export interface GradleDependencyUpdate {
  name: string;
  group: string;
  fullName: string;
  oldVersion: string;
  newVersion: string;
}

export interface AndroidProjectDependenciesUpdates {
  report: AndroidProjectReport;
  updates: GradleDependencyUpdate[];
}
