// @needsAudit
export type PowerState = {
  /**
   * A number between `0` and `1`, inclusive, or `-1` if the battery level is unknown.
   */
  batteryLevel: number;
  /**
   * An enum value representing the battery state.
   */
  batteryState: BatteryState;
  /**
   * A boolean value, `true` if lowPowerMode is on, `false` if lowPowerMode is off
   */
  lowPowerMode: boolean;
};

// @needsAudit
export enum BatteryState {
  /**
   * if the battery state is unknown or inaccessible.
   */
  UNKNOWN = 0,
  /**
   * if battery is not charging or discharging.
   */
  UNPLUGGED,
  /**
   * if battery is charging.
   */
  CHARGING,
  /**
   * if the battery level is full.
   */
  FULL,
}

// @needsAudit
export type BatteryLevelEvent = {
  /**
   * A number between `0` and `1`, inclusive, or `-1` if the battery level is unknown.
   */
  batteryLevel: number;
};

// @needsAudit
export type BatteryStateEvent = {
  /**
   * An enum value representing the battery state.
   */
  batteryState: BatteryState;
};

// @needsAudit
export type PowerModeEvent = {
  /**
   * A boolean value, `true` if lowPowerMode is on, `false` if lowPowerMode is off
   */
  lowPowerMode: boolean;
};
