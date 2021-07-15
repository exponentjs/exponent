import Constants from 'expo-constants';
import prettyFormat from 'pretty-format';
import parseErrorStack from 'react-native/Libraries/Core/Devtools/parseErrorStack';
import symbolicateStackTrace from 'react-native/Libraries/Core/Devtools/symbolicateStackTrace';
import ReactNodeFormatter from './format/ReactNodeFormatter';
export const EXPO_CONSOLE_METHOD_NAME = '__expoConsoleLog';
async function serializeLogDataAsync(data, level) {
    let serializedValues;
    let includesStack = false;
    if (_stackTraceLogsSupported()) {
        if (_isUnhandledPromiseRejection(data, level)) {
            const rawStack = data[0];
            const syntheticError = { stack: rawStack };
            const stack = await _symbolicateErrorAsync(syntheticError);
            if (!stack.length) {
                serializedValues = _stringifyLogData(data);
            }
            else {
                // NOTE: This doesn't handle error messages with newlines
                const errorMessage = rawStack.split('\n')[1];
                serializedValues = [
                    {
                        message: `[Unhandled promise rejection: ${errorMessage}]`,
                        stack: _formatStack(stack),
                    },
                ];
                includesStack = true;
            }
        }
        else if (data.length === 1 && data[0] instanceof Error) {
            // When there's only one argument to the log function and that argument is an error, we
            // include the error's stack. If there's more than one argument then we don't include the
            // stack because it's not easy to display nicely in our current UI.
            const serializedError = await _serializeErrorAsync(data[0]);
            serializedValues = [serializedError];
            includesStack = serializedError.hasOwnProperty('stack');
        }
        else if (level === 'warn' || level === 'error') {
            // For console.warn and console.error it is usually useful to know the stack that leads to the
            // warning or error, so we provide this information to help out with debugging
            const error = _captureConsoleStackTrace();
            // ["hello", "world"] becomes "hello, world"
            const errorMessage = _stringifyLogData(data).join(', ');
            const serializedError = await _serializeErrorAsync(error, errorMessage);
            serializedValues = [serializedError];
            includesStack = serializedError.hasOwnProperty('stack');
        }
        else {
            serializedValues = _stringifyLogData(data);
        }
    }
    else {
        serializedValues = _stringifyLogData(data);
    }
    return {
        body: [...serializedValues],
        includesStack,
    };
}
function _stringifyLogData(data) {
    return data.map(item => {
        // define the max length for log msg to be first 10000 characters
        const LOG_MESSAGE_MAX_LENGTH = 10000;
        const result = typeof item === 'string' ? item : prettyFormat(item, { plugins: [ReactNodeFormatter] });
        // check the size of string returned
        if (result.length > LOG_MESSAGE_MAX_LENGTH) {
            let truncatedResult = result.substring(0, LOG_MESSAGE_MAX_LENGTH);
            // truncate the result string to the max length
            truncatedResult += `...(truncated to the first ${LOG_MESSAGE_MAX_LENGTH} characters)`;
            return truncatedResult;
        }
        else {
            return result;
        }
    });
}
async function _serializeErrorAsync(error, message) {
    if (message == null) {
        message = error.message;
    }
    if (!error.stack || !error.stack.length) {
        return prettyFormat(error);
    }
    const stack = await _symbolicateErrorAsync(error);
    const formattedStack = _formatStack(stack);
    return { message, stack: formattedStack };
}
async function _symbolicateErrorAsync(error) {
    const parsedStack = parseErrorStack(error);
    let symbolicatedStack;
    try {
        // @ts-ignore: symbolicateStackTrace has different real/Flow declaration
        // than the one in DefinitelyTyped.
        symbolicatedStack = (await symbolicateStackTrace(parsedStack))?.stack ?? null;
    }
    catch (error) {
        return parsedStack;
    }
    // In this context an unsymbolicated stack is better than no stack
    if (!symbolicatedStack) {
        return parsedStack;
    }
    // Clean the stack trace
    return symbolicatedStack.map(_removeProjectRoot);
}
function _formatStack(stack) {
    return stack
        .map(frame => {
        let line = `${frame.file}:${frame.lineNumber}`;
        if (frame.column != null) {
            line += `:${frame.column}`;
        }
        line += ` in ${frame.methodName}`;
        return line;
    })
        .join('\n');
}
function _removeProjectRoot(frame) {
    let filename = frame.file;
    if (filename == null) {
        return frame;
    }
    const projectRoot = _getProjectRoot();
    if (projectRoot == null) {
        return frame;
    }
    if (filename.startsWith(projectRoot)) {
        filename = filename.substring(projectRoot.length);
        if (filename[0] === '/' || filename[0] === '\\') {
            filename = filename.substring(1);
        }
        frame.file = filename;
    }
    return frame;
}
/**
 * Returns whether the development server that served this project supports logs with a stack trace.
 * Specifically, the version of Expo CLI that includes `projectRoot` in the manifest also accepts
 * payloads of the form:
 *
 * {
 *   includesStack: boolean, body: [{ message: string, stack: string }],
 * }
 */
function _stackTraceLogsSupported() {
    return !!(__DEV__ && _getProjectRoot());
}
function _isUnhandledPromiseRejection(data, level) {
    return (level === 'warn' &&
        typeof data[0] === 'string' &&
        /^Possible Unhandled Promise Rejection/.test(data[0]));
}
function _captureConsoleStackTrace() {
    try {
        throw new Error();
    }
    catch (error) {
        let stackLines = error.stack.split('\n');
        const consoleMethodIndex = stackLines.findIndex(frame => frame.includes(EXPO_CONSOLE_METHOD_NAME));
        if (consoleMethodIndex !== -1) {
            stackLines = stackLines.slice(consoleMethodIndex + 1);
            error.stack = stackLines.join('\n');
        }
        return error;
    }
}
function _getProjectRoot() {
    return (Constants.manifest?.developer?.projectRoot ??
        Constants.manifest2?.extra?.expoGo?.developer?.projectRoot ??
        null);
}
export default {
    serializeLogDataAsync,
};
//# sourceMappingURL=LogSerialization.js.map