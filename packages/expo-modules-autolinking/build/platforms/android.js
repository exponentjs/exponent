"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveModuleAsync = exports.generatePackageListAsync = void 0;
const fast_glob_1 = __importDefault(require("fast-glob"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
/**
 * Generates Java file that contains all autolinked packages.
 */
async function generatePackageListAsync(modules, targetPath, namespace) {
    const generatedFileContent = await generatePackageListFileContentAsync(modules, namespace);
    await fs_extra_1.default.outputFile(targetPath, generatedFileContent);
}
exports.generatePackageListAsync = generatePackageListAsync;
async function resolveModuleAsync(packageName, revision) {
    // TODO: Relative source dir should be configurable through the module config.
    // Don't link itself... :D
    if (packageName === '@unimodules/react-native-adapter') {
        return null;
    }
    const [buildGradleFile] = await fast_glob_1.default('*/build.gradle', {
        cwd: revision.path,
        ignore: ['**/node_modules/**'],
    });
    const sourceDir = path_1.default.dirname(path_1.default.join(revision.path, buildGradleFile));
    return {
        projectName: convertPackageNameToProjectName(packageName),
        sourceDir,
    };
}
exports.resolveModuleAsync = resolveModuleAsync;
/**
 * Generates the string to put into the generated package list.
 */
async function generatePackageListFileContentAsync(modules, namespace) {
    const packagesClasses = await findAndroidPackagesAsync(modules);
    return `package ${namespace};

import java.util.Arrays;
import java.util.List;
import org.unimodules.core.interfaces.Package;

public class ExpoModulesPackageList {
  private static class LazyHolder {
    static final List<Package> packagesList = Arrays.<Package>asList(
${packagesClasses.map(packageClass => `      new ${packageClass}()`).join(',\n')}
    );
  }

  public static List<Package> getPackageList() {
    return LazyHolder.packagesList;
  }
}
`;
}
async function findAndroidPackagesAsync(modules) {
    const classes = [];
    await Promise.all(modules.map(async (module) => {
        const files = await fast_glob_1.default('src/**/*Package.{java,kt}', {
            cwd: module.sourceDir,
        });
        for (const file of files) {
            const fileContent = await fs_extra_1.default.readFile(path_1.default.join(module.sourceDir, file), 'utf8');
            // Very naive check to skip non-expo packages
            if (!/\bimport\s+org\.unimodules\.core\.(interfaces\.Package|BasePackage)\b/.test(fileContent)) {
                continue;
            }
            const classPathMatches = fileContent.match(/^package ([\w.]+)\b/m);
            if (classPathMatches) {
                const basename = path_1.default.basename(file, path_1.default.extname(file));
                classes.push(`${classPathMatches[1]}.${basename}`);
            }
        }
    }));
    return classes.sort();
}
/**
 * Converts the package name to Android's project name.
 * Example: `@unimodules/core` → `unimodules-core`
 */
function convertPackageNameToProjectName(projectName) {
    return projectName.replace(/^@/g, '').replace(/\W+/g, '-');
}
//# sourceMappingURL=android.js.map