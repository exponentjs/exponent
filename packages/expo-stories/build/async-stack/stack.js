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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stack = void 0;
var React = __importStar(require("react"));
var react_native_1 = require("react-native");
var react_native_screens_1 = require("react-native-screens");
var createAsyncStack_1 = require("./createAsyncStack");
function WebStack(_a) {
    var stack = _a.stack, children = _a.children;
    var screens = createAsyncStack_1.useStackItems(stack);
    return (React.createElement(WebScreenStack, { style: __assign(__assign({}, react_native_1.StyleSheet.absoluteFillObject), { overflow: 'hidden' }) },
        children,
        screens.map(function (screen) {
            return (React.createElement(WebScreen, { key: screen.key, status: screen.status, onPushEnd: function () { return stack.onPushEnd(screen.key); }, onPopEnd: function () { return stack.onPopEnd(screen.key); } }, screen.element));
        })));
}
function WebScreenStack(props) {
    return React.createElement(react_native_1.View, __assign({}, props));
}
function WebScreen(_a) {
    var children = _a.children, onPushEnd = _a.onPushEnd, onPopEnd = _a.onPopEnd, status = _a.status;
    var animatedValue = React.useRef(new react_native_1.Animated.Value(status === 'settled' ? 1 : 0));
    React.useEffect(function () {
        if (status === 'pushing') {
            react_native_1.Animated.spring(animatedValue.current, {
                toValue: 1,
                useNativeDriver: true,
                stiffness: 1000,
                damping: 500,
                mass: 3,
                overshootClamping: true,
            }).start(onPushEnd);
        }
        if (status === 'popping') {
            react_native_1.Animated.spring(animatedValue.current, {
                toValue: 0,
                useNativeDriver: true,
                stiffness: 1000,
                damping: 500,
                mass: 3,
                overshootClamping: true,
            }).start(onPopEnd);
        }
    }, [status]);
    var translateX = animatedValue.current.interpolate({
        inputRange: [0, 1],
        outputRange: ['100%', '0%'],
    });
    return (React.createElement(react_native_1.Animated.View, { pointerEvents: status === 'popping' ? 'none' : 'auto', style: [react_native_1.StyleSheet.absoluteFill, { transform: [{ translateX: translateX }] }] }, children));
}
function NativeStack(_a) {
    var stack = _a.stack, children = _a.children;
    var screens = createAsyncStack_1.useStackItems(stack);
    return (React.createElement(react_native_screens_1.ScreenStack, { style: react_native_1.StyleSheet.absoluteFill },
        React.createElement(NativeScreen, { status: "settled" }, children),
        screens.map(function (screen, i) {
            return (React.createElement(NativeScreen, __assign({ index: i, key: screen.key, status: screen.status, onPushEnd: function () { return stack.onPushEnd(screen.key); }, onPopEnd: function () { return stack.onPopEnd(screen.key); } }, (screen.screenProps || {})),
                React.createElement(react_native_screens_1.ScreenStackHeaderConfig, __assign({ hidden: !screen.headerProps }, screen.headerProps)),
                screen.element || null));
        })));
}
function NativeScreen(_a) {
    var index = _a.index, status = _a.status, onPushEnd = _a.onPushEnd, onPopEnd = _a.onPopEnd, children = _a.children, props = __rest(_a, ["index", "status", "onPushEnd", "onPopEnd", "children"]);
    React.useEffect(function () {
        if (status === 'pushing') {
            onPushEnd();
        }
        if (status === 'popping') {
            onPopEnd();
        }
    }, [status, onPushEnd, onPopEnd]);
    return (React.createElement(react_native_screens_1.Screen, __assign({ active: 1, activityState: 2, style: react_native_1.StyleSheet.absoluteFill, onDismissed: onPopEnd, gestureEnabled: index !== 0 }, props), children));
}
var Stack = react_native_1.Platform.select({
    native: NativeStack,
    web: WebStack,
    default: WebStack,
});
exports.Stack = Stack;
WebStack.createStack = function () { return createAsyncStack_1.createAsyncStack(); };
NativeStack.createStack = function () { return createAsyncStack_1.createAsyncStack(); };
//# sourceMappingURL=stack.js.map