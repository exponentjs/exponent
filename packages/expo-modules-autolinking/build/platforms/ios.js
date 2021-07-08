"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePackageListAsync = exports.resolveModuleAsync = void 0;
const fast_glob_1 = __importDefault(require("fast-glob"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
/**
 * Resolves module search result with additional details required for iOS platform.
 */
async function resolveModuleAsync(packageName, revision, options) {
    var _a;
    const [podspecFile] = await fast_glob_1.default('*/*.podspec', {
        cwd: revision.path,
        ignore: ['**/node_modules/**'],
    });
    if (!podspecFile) {
        return null;
    }
    const podName = path_1.default.basename(podspecFile, path_1.default.extname(podspecFile));
    const podspecDir = path_1.default.dirname(path_1.default.join(revision.path, podspecFile));
    return {
        podName,
        podspecDir,
        flags: options.flags,
        modulesClassNames: (_a = revision.config) === null || _a === void 0 ? void 0 : _a.iosModulesClassNames(),
    };
}
exports.resolveModuleAsync = resolveModuleAsync;
/**
 * Generates Swift file that contains all autolinked Swift packages.
 */
async function generatePackageListAsync(modules, targetPath) {
    const className = path_1.default.basename(targetPath, path_1.default.extname(targetPath));
    const generatedFileContent = await generatePackageListFileContentAsync(modules, className);
    await fs_extra_1.default.outputFile(targetPath, generatedFileContent);
}
exports.generatePackageListAsync = generatePackageListAsync;
/**
 * Generates the string to put into the generated package list.
 */
async function generatePackageListFileContentAsync(modules, className) {
    const modulesToProvide = modules.filter(module => module.modulesClassNames.length > 0);
    const pods = modulesToProvide.map(module => module.podName);
    const classNames = [].concat(...modulesToProvide.map(module => module.modulesClassNames));
    return `// Automatically generated by expo-modules-autolinking.
import ExpoModulesCore

${pods.map(podName => `import ${podName}`).join('\n')}

@objc(${className})
public class ${className}: ModulesProvider {
  public override func exportedModules() -> [AnyModule.Type] {
    return [
      ${classNames.map(className => `${className}.self`).join('\n')}
    ]
  }
}
`;
}
//# sourceMappingURL=ios.js.map