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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStackItems = exports.createAsyncStack = void 0;
var React = __importStar(require("react"));
var generateRouteKey = function () { return "" + new Date().getTime(); };
function createAsyncStack() {
    var keys = [];
    var lookup = {};
    var pushResolvers = {};
    var popResolvers = {};
    var listeners = [];
    function push(pushOptions) {
        var key = pushOptions.key || generateRouteKey();
        if (keys.includes(key)) {
            return Promise.resolve(key);
        }
        keys.push(key);
        lookup[key] = __assign(__assign({}, pushOptions), { key: key, status: 'pushing' });
        var promise = new Promise(function (resolve) {
            pushResolvers[key] = resolve;
        });
        emit('pushstart', key);
        return promise;
    }
    function onPushEnd(key) {
        var item = lookup[key];
        if (item) {
            item.status = 'settled';
            emit('pushend', key);
            var resolver = pushResolvers[key];
            if (resolver) {
                resolver(key);
            }
        }
    }
    function pop(amount, startIndex) {
        if (amount === void 0) { amount = 1; }
        if (startIndex === void 0) { startIndex = 0; }
        var promises = [];
        if (amount === -1) {
            // pop them all
            amount = keys.length;
        }
        var _loop_1 = function (i) {
            var key = keys[keys.length - startIndex - i];
            var item = lookup[key];
            if (item) {
                item.status = 'popping';
                var promise = new Promise(function (resolve) {
                    popResolvers[key] = resolve;
                });
                promises.push(promise);
                emit('popstart', key);
            }
        };
        for (var i = 1; i <= amount; i++) {
            _loop_1(i);
        }
        return Promise.all(promises);
    }
    function onPopEnd(key) {
        keys = keys.filter(function (k) { return k !== key; });
        var resolver = popResolvers[key];
        if (resolver) {
            resolver(key);
        }
        delete popResolvers[key];
        delete pushResolvers[key];
        emit('popend', key);
    }
    function replace(replaceOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var itemsToPop, promise2, promise1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        itemsToPop = replaceOptions.replaceAmount != null ? replaceOptions.replaceAmount : 1;
                        return [4 /*yield*/, push(replaceOptions)];
                    case 1:
                        promise2 = _a.sent();
                        return [4 /*yield*/, pop(itemsToPop, 1)];
                    case 2:
                        promise1 = _a.sent();
                        return [2 /*return*/, Promise.all([promise2, promise1])];
                }
            });
        });
    }
    function subscribe(listener) {
        listeners.push(listener);
        return function () {
            listeners = listeners.filter(function (l) { return l !== listener; });
        };
    }
    function emit(action, key) {
        listeners.forEach(function (listener) {
            var state = getState();
            listener(__assign(__assign({}, state), { key: key, action: action }));
        });
    }
    function getItemByKey(key) {
        return lookup[key];
    }
    function getState() {
        var items = keys.map(function (key) { return lookup[key]; });
        return {
            items: items,
            getItemByKey: getItemByKey,
        };
    }
    function update(index, updates) {
        var key = keys[index];
        console.log({ updates: updates });
        lookup[key] = __assign(__assign({}, lookup[key]), updates);
        emit('itemupdate', key);
    }
    return {
        push: push,
        onPushEnd: onPushEnd,
        pop: pop,
        onPopEnd: onPopEnd,
        replace: replace,
        subscribe: subscribe,
        getState: getState,
        update: update,
    };
}
exports.createAsyncStack = createAsyncStack;
function useStackItems(stack) {
    var _a = React.useState(function () { return stack.getState().items; }), items = _a[0], setItems = _a[1];
    React.useEffect(function () {
        var unsubscribe = stack.subscribe(function (_a) {
            var items = _a.items;
            setItems(items);
        });
        return function () {
            unsubscribe && unsubscribe();
        };
    }, [stack]);
    return items;
}
exports.useStackItems = useStackItems;
//# sourceMappingURL=createAsyncStack.js.map