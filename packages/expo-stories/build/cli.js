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
var commander_1 = require("commander");
var path_1 = __importDefault(require("path"));
var constants_1 = require("./constants");
var server_1 = require("./server");
commander_1.program.version('0.0.1');
var startCommand = new commander_1.Command();
startCommand
    .name('start')
    .option('-p, --port', 'port to run the server on', '7001')
    .option('-r, --projectRoot <path>', 'the directory for the server to run', process.cwd())
    .option('-w --watchRoot <path>', 'the directory for the server to watch', process.cwd())
    .action(function (options) {
    options = __assign(__assign({}, constants_1.defaultConfig), options);
    options.watchRoot = path_1.default.resolve(process.cwd(), options.watchRoot);
    server_1.startServer(options);
});
commander_1.program.addCommand(startCommand);
commander_1.program.parse(process.argv);
//# sourceMappingURL=cli.js.map