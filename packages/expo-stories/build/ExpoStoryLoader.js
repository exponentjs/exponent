"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpoStoryLoader = void 0;
var styleguide_native_1 = require("@expo/styleguide-native");
var React = __importStar(require("react"));
var react_native_1 = require("react-native");
// this is resolved via customization (extraNodeModules) in metro-config / webpack-config
var stories = require('generated-expo-stories');
function ExpoStoryLoader(_a) {
    var selectedStoryId = _a.selectedStoryId, _b = _a.displayStoryTitle, displayStoryTitle = _b === void 0 ? false : _b;
    var selectedStories = [];
    if (selectedStoryId !== '') {
        Object.keys(stories).forEach(function (key) {
            if (key.startsWith(selectedStoryId)) {
                // @ts-ignore
                selectedStories.push(stories[key]);
            }
        });
    }
    return (React.createElement(react_native_1.View, { style: react_native_1.StyleSheet.absoluteFill },
        React.createElement(react_native_1.SafeAreaView, { style: styles.flexContainer },
            React.createElement(react_native_1.ScrollView, { style: styles.flexContainer }, Object.entries(selectedStories).map(function (_a) {
                var key = _a[0], story = _a[1];
                return (React.createElement(react_native_1.View, { key: "" + key, style: styles.storyRow },
                    displayStoryTitle && React.createElement(react_native_1.Text, { style: styles.storyTitle }, (story === null || story === void 0 ? void 0 : story.name) || ''),
                    React.createElement(story)));
            })))));
}
exports.ExpoStoryLoader = ExpoStoryLoader;
var styles = react_native_1.StyleSheet.create({
    flexContainer: {
        flex: 1,
        backgroundColor: styleguide_native_1.lightTheme.background.default,
        padding: styleguide_native_1.spacing[2],
    },
    storyRow: {
        paddingHorizontal: styleguide_native_1.spacing[2],
        paddingVertical: styleguide_native_1.spacing[3],
        borderBottomWidth: 1,
        borderColor: styleguide_native_1.lightTheme.border.default,
    },
    storyTitle: {
        marginBottom: styleguide_native_1.spacing[2],
        fontSize: 20,
        fontWeight: '500',
    },
});
//# sourceMappingURL=ExpoStoryLoader.js.map