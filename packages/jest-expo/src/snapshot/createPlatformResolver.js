const path = require('path');

const snapshotsDirectory = '__snapshots__';
module.exports = platform => {
  const getExt = ext => `${ext}.${platform}`;
  return {
    resolveSnapshotPath: (testPath, snapshotExtension) => {
      const snapshotFilename = path.basename(testPath) + getExt(snapshotExtension);
      const snapshotFilePath = path.posix.join(
        path.dirname(testPath),
        snapshotsDirectory,
        snapshotFilename
      );
      return snapshotFilePath;
    },

    resolveTestPath: (snapshotFilePath, snapshotExtension) => {
      const testPath = snapshotFilePath
        .replace(snapshotsDirectory, '')
        .slice(0, -getExt(snapshotExtension).length);
      return path.posix.normalize(testPath);
    },

    testPathForConsistencyCheck: path.posix.join(
      'consistency_check',
      '__tests__',
      'example.test.js'
    ),
  };
};
