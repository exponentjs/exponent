import { NativeModulesProxy, EventEmitter } from 'expo-core';
const { ExpoTaskManager } = NativeModulesProxy;
const eventEmitter = new EventEmitter(ExpoTaskManager);
const tasks = new Map();
let isRunningDuringInitialization = true;
function _validateTaskName(taskName) {
    if (!taskName || typeof taskName !== 'string') {
        throw new TypeError('`taskName` must be a non-empty string.');
    }
}
function defineTask(taskName, task) {
    if (!isRunningDuringInitialization) {
        console.error(`TaskManager.defineTask must be called during initialization phase!`);
        return;
    }
    if (!taskName || typeof taskName !== 'string') {
        console.warn(`TaskManager.defineTask: 'taskName' argument must be a non-empty string.`);
        return;
    }
    if (!task || typeof task !== 'function') {
        console.warn(`TaskManager.defineTask: 'task' argument must be a function.`);
        return;
    }
    if (tasks.has(taskName)) {
        console.warn(`TaskManager.defineTask: task '${taskName}' is already defined.`);
        return;
    }
    tasks.set(taskName, task);
}
function isTaskDefined(taskName) {
    return tasks.has(taskName);
}
async function isTaskRegisteredAsync(taskName) {
    _validateTaskName(taskName);
    return ExpoTaskManager.isTaskRegisteredAsync(taskName);
}
async function getTaskOptionsAsync(taskName) {
    _validateTaskName(taskName);
    return ExpoTaskManager.getTaskOptionsAsync(taskName);
}
async function getRegisteredTasksAsync() {
    return ExpoTaskManager.getRegisteredTasksAsync();
}
async function unregisterTaskAsync(taskName) {
    _validateTaskName(taskName);
    await ExpoTaskManager.unregisterTaskAsync(taskName);
}
async function unregisterAllTasksAsync() {
    await ExpoTaskManager.unregisterAllTasksAsync();
}
eventEmitter.addListener(ExpoTaskManager.EVENT_NAME, async ({ data, error, executionInfo }) => {
    const { eventId, taskName } = executionInfo;
    const task = tasks.get(taskName);
    let result = null;
    if (task) {
        try {
            // Execute JS task
            result = await task({ data, error, executionInfo });
        }
        catch (error) {
            console.error(`TaskManager: Task "${taskName}" failed:`, error);
        }
        finally {
            // Notify manager the task is finished.
            await ExpoTaskManager.notifyTaskFinishedAsync(taskName, { eventId, result });
        }
    }
    else {
        console.warn(`TaskManager: Task "${taskName}" has been executed but looks like it is not defined. Please make sure that "TaskManager.defineTask" is called during initialization phase.`);
        // No tasks defined -> we need to notify about finish anyway.
        await ExpoTaskManager.notifyTaskFinishedAsync(taskName, { eventId, result });
        // We should also unregister such tasks automatically as the task might have been removed
        // from the app or just renamed - in that case it needs to be registered again (with the new name).
        await ExpoTaskManager.unregisterTaskAsync(taskName);
    }
});
// @tsapeta: Turn off `defineTask` function right after the initialization phase.
// Promise.resolve() ensures that it will be called as a microtask just after the first event loop.
Promise.resolve().then(() => {
    isRunningDuringInitialization = false;
});
export const TaskManager = {
    defineTask,
    isTaskDefined,
    isTaskRegisteredAsync,
    getTaskOptionsAsync,
    getRegisteredTasksAsync,
    unregisterTaskAsync,
    unregisterAllTasksAsync,
};
//# sourceMappingURL=TaskManager.js.map