// @needsAudit
export enum BackgroundFetchResult {
  /** There was no new data to download. */
  NoData = 1,
  /** New data was successfully downloaded. */
  NewData = 2,
  /** An attempt to download data was made but that attempt failed. */
  Failed = 3,
}

// @needsAudit
export enum BackgroundFetchStatus {
  /**
   * The user explicitly disabled background behavior for this app or for the whole system.
   */
  Denied = 1,
  /**
   * Background updates are unavailable and the user cannot enable them again.
   * This status can occur when, for example, parental controls are in effect for the current user.
   */
  Restricted = 2,
  /** Background updates are available for the app. */
  Available = 3,
}

// @needsAudit
export interface BackgroundFetchOptions {
  /**
   * Inexact interval in seconds between subsequent repeats of the background fetch alarm.
   * The final interval may differ from the specified one to minimize wakeups and battery usage.
   *
   * On Android it defaults to **15 minutes**.
   *
   * On iOS it calls `BackgroundFetch.setMinimumIntervalAsync` behind the scenes
   * and the default value is the smallest fetch interval supported by the
   * system (**10-15 minutes**).
   */
  minimumInterval?: number;
  /**
   * Whether to stop receiving background fetch events after user terminates the app. Defaults to `true`. (**Android only**)
   */
  stopOnTerminate?: boolean;
  /**
   * Whether to restart background fetch events when the device has finished booting. Defaults to `false`. (**Android only**)
   */
  startOnBoot?: boolean;
}
