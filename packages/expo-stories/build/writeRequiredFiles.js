"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeRequiredFiles = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var constants_1 = require("./constants");
var getConfig_1 = require("./getConfig");
function writeRequiredFiles(serverConfig) {
    var config = getConfig_1.getConfig(serverConfig);
    var projectRoot = config.projectRoot, watchRoot = config.watchRoot, port = config.port;
    var pathToStories = path_1.default.resolve(projectRoot, constants_1.storiesFileDir);
    if (!fs_1.default.existsSync(pathToStories)) {
        fs_1.default.mkdirSync(pathToStories, { recursive: true });
    }
    var pathToStoryFile = path_1.default.resolve(pathToStories, 'stories.js');
    if (!fs_1.default.existsSync(pathToStoryFile)) {
        fs_1.default.writeFileSync(pathToStoryFile, 'module.exports = {}', {
            encoding: 'utf-8',
        });
    }
    var pathToStoryManifest = path_1.default.resolve(pathToStories, 'storyManifest.json');
    if (fs_1.default.existsSync(pathToStoryManifest)) {
        var storyManifest = require(pathToStoryManifest);
        if (storyManifest.watchRoot !== watchRoot || storyManifest.projectRoot !== projectRoot) {
            fs_1.default.unlinkSync(pathToStoryManifest);
        }
    }
    if (!fs_1.default.existsSync(pathToStoryManifest)) {
        var emptyManifest = {
            watchRoot: watchRoot,
            port: port,
            projectRoot: projectRoot,
            files: {},
        };
        var emptyManifestAsString = JSON.stringify(emptyManifest, null, '\t');
        delete require.cache[pathToStoryManifest];
        fs_1.default.writeFileSync(pathToStoryManifest, emptyManifestAsString, {
            encoding: 'utf-8',
        });
    }
}
exports.writeRequiredFiles = writeRequiredFiles;
//# sourceMappingURL=writeRequiredFiles.js.map