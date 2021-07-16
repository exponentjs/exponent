"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
var path_1 = __importDefault(require("path"));
var constants_1 = require("./constants");
function getConfig(serverConfig) {
    var _a;
    var config = __assign(__assign({}, constants_1.defaultConfig), serverConfig);
    var pathToPackageJson = path_1.default.resolve(config.projectRoot, 'package.json');
    var packageJson = require(pathToPackageJson);
    var packageJsonConfig = (_a = packageJson.expoStories) !== null && _a !== void 0 ? _a : {};
    config = __assign(__assign({}, config), packageJsonConfig);
    return config;
}
exports.getConfig = getConfig;
//# sourceMappingURL=getConfig.js.map