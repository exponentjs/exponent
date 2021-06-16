import { Platform, UnavailabilityError } from '@unimodules/core';
import * as TaskManager from 'expo-task-manager';

import {
  BackgroundFetchOptions,
  BackgroundFetchResult,
  BackgroundFetchStatus,
} from './BackgroundFetch.types';
import ExpoBackgroundFetch from './ExpoBackgroundFetch';

// @needsAudit
/**
 * Gets a status of background fetch.
 *
 * @returns A promise with the background fetch status enum, or `null` when unavailable.
 */
export async function getStatusAsync(): Promise<BackgroundFetchStatus | null> {
  if (Platform.OS === 'android') {
    return BackgroundFetchStatus.Available;
  }
  return ExpoBackgroundFetch.getStatusAsync();
}

/**
 * Sets the minimum number of seconds that must elapse before another background fetch can be initiated. This value is advisory only and does not indicate the exact amount of time expected between fetch operations.
 *
 * _This method doesn't take any effect on Android._
 *
 * _It is a global value which means that it can overwrite settings from another application opened through Expo Go._
 *
 * @param minimumInterval Number of seconds that must elapse before another background fetch can be called.
 * @returns A promise resolving once the minimum interval is set.
 */
export async function setMinimumIntervalAsync(minimumInterval: number): Promise<void> {
  if (!ExpoBackgroundFetch.setMinimumIntervalAsync) {
    return;
  }
  // iOS only
  await ExpoBackgroundFetch.setMinimumIntervalAsync(minimumInterval);
}

// @needsAudit
/**
 * Registers background fetch task with given name. Registered tasks are saved in persistent storage and restored once the app is initialized.
 *
 * @param taskName Name of the task to register. The task needs to be defined first - see `TaskManager.defineTask` for more details.
 * @param options The background fetch task options.
 * @returns Returns a promise that resolves once the task is registered and rejects in case of any errors.
 */
export async function registerTaskAsync(
  taskName: string,
  options: BackgroundFetchOptions = {}
): Promise<void> {
  if (!ExpoBackgroundFetch.registerTaskAsync) {
    throw new UnavailabilityError('BackgroundFetch', 'registerTaskAsync');
  }
  if (!TaskManager.isTaskDefined(taskName)) {
    throw new Error(
      `Task '${taskName}' is not defined. You must define a task using TaskManager.defineTask before registering.`
    );
  }
  await ExpoBackgroundFetch.registerTaskAsync(taskName, options);
}

// @needsAudit
/**
 * Unregisters background fetch task, so the application will no longer be executing this task.
 *
 * @param taskName Name of the task to unregister.
 * @returns A promise resolving when the task is fully unregistered.
 */
export async function unregisterTaskAsync(taskName: string): Promise<void> {
  if (!ExpoBackgroundFetch.unregisterTaskAsync) {
    throw new UnavailabilityError('BackgroundFetch', 'unregisterTaskAsync');
  }
  await ExpoBackgroundFetch.unregisterTaskAsync(taskName);
}

export { BackgroundFetchResult as Result, BackgroundFetchStatus as Status };
