"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = exports.storiesFileDir = void 0;
exports.storiesFileDir = '__generated__/stories';
exports.defaultConfig = {
    projectRoot: process.cwd(),
    watchRoot: process.cwd(),
    // eslint-disable-next-line
    port: parseInt((_a = process.env.PORT) !== null && _a !== void 0 ? _a : '7001'),
};
//# sourceMappingURL=constants.js.map