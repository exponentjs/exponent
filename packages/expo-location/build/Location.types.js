// @needsAudit
/**
 * Enum with available location accuracies.
 */
export var LocationAccuracy;
(function (LocationAccuracy) {
    /**
     * Accurate to the nearest three kilometers.
     */
    LocationAccuracy[LocationAccuracy["Lowest"] = 1] = "Lowest";
    /**
     * Accurate to the nearest kilometer.
     */
    LocationAccuracy[LocationAccuracy["Low"] = 2] = "Low";
    /**
     * Accurate to within one hundred meters.
     */
    LocationAccuracy[LocationAccuracy["Balanced"] = 3] = "Balanced";
    /**
     * Accurate to within ten meters of the desired target.
     */
    LocationAccuracy[LocationAccuracy["High"] = 4] = "High";
    /**
     * The best level of accuracy available.
     */
    LocationAccuracy[LocationAccuracy["Highest"] = 5] = "Highest";
    /**
     * The highest possible accuracy that uses additional sensor data
     * to facilitate navigation apps.
     */
    LocationAccuracy[LocationAccuracy["BestForNavigation"] = 6] = "BestForNavigation";
})(LocationAccuracy || (LocationAccuracy = {}));
// @needsAudit
/**
 * Enum with available activity types of background location tracking.
 */
export var LocationActivityType;
(function (LocationActivityType) {
    /**
     * Default activity type.
     * Use it if there is no other type that matches the activity you track.
     */
    LocationActivityType[LocationActivityType["Other"] = 1] = "Other";
    /**
     * Location updates are being used specifically during vehicular navigation
     *  to track location changes to the automobile.
     */
    LocationActivityType[LocationActivityType["AutomotiveNavigation"] = 2] = "AutomotiveNavigation";
    /**
     * Use this activity type if you track fitness activities
     * such as walking, running, cycling, and so on.
     */
    LocationActivityType[LocationActivityType["Fitness"] = 3] = "Fitness";
    /**
     * Activity type for movements for other types of vehicular navigation
     * that are not automobile related.
     */
    LocationActivityType[LocationActivityType["OtherNavigation"] = 4] = "OtherNavigation";
    /**
     * Intended for airborne activities.
     * Available since iOS 12.0, fall backs to ActivityType.Other otherwise.
     */
    LocationActivityType[LocationActivityType["Airborne"] = 5] = "Airborne";
})(LocationActivityType || (LocationActivityType = {}));
// @needsAudit
/**
 * A type of the event that geofencing task can receive.
 */
export var LocationGeofencingEventType;
(function (LocationGeofencingEventType) {
    /**
     * Emitted when the device entered observed region.
     */
    LocationGeofencingEventType[LocationGeofencingEventType["Enter"] = 1] = "Enter";
    /**
     * Occurs as soon as the device left observed region.
     */
    LocationGeofencingEventType[LocationGeofencingEventType["Exit"] = 2] = "Exit";
})(LocationGeofencingEventType || (LocationGeofencingEventType = {}));
// @needsAudit
/**
 * State of the geofencing region that you receive through the geofencing task.
 */
export var LocationGeofencingRegionState;
(function (LocationGeofencingRegionState) {
    /**
     * The device state is unknown
     */
    LocationGeofencingRegionState[LocationGeofencingRegionState["Unknown"] = 0] = "Unknown";
    /**
     * Indicates that the device is inside the region.
     */
    LocationGeofencingRegionState[LocationGeofencingRegionState["Inside"] = 1] = "Inside";
    /**
     * Inverse of inside state.
     */
    LocationGeofencingRegionState[LocationGeofencingRegionState["Outside"] = 2] = "Outside";
})(LocationGeofencingRegionState || (LocationGeofencingRegionState = {}));
//# sourceMappingURL=Location.types.js.map