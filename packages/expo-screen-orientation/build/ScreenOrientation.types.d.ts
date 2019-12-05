export declare enum Orientation {
    UNKNOWN = 0,
    PORTRAIT_UP = 1,
    PORTRAIT_DOWN = 2,
    LANDSCAPE_LEFT = 3,
    LANDSCAPE_RIGHT = 4
}
export declare enum OrientationLock {
    DEFAULT = 0,
    ALL = 1,
    PORTRAIT = 2,
    PORTRAIT_UP = 3,
    PORTRAIT_DOWN = 4,
    LANDSCAPE = 5,
    LANDSCAPE_LEFT = 6,
    LANDSCAPE_RIGHT = 7,
    OTHER = 8,
    UNKNOWN = 9,
    ALL_BUT_UPSIDE_DOWN = 10
}
export declare enum SizeClassIOS {
    REGULAR = "REGULAR",
    COMPACT = "COMPACT",
    UNKNOWN = "UNKNOWN"
}
export declare enum WebOrientationLock {
    PORTRAIT_PRIMARY = "portrait-primary",
    PORTRAIT_SECONDARY = "portrait-secondary",
    PORTRAIT = "portrait",
    LANDSCAPE_PRIMARY = "landscape-primary",
    LANDSCAPE_SECONDARY = "landscape-secondary",
    LANDSCAPE = "landscape",
    ANY = "any",
    NATURAL = "natural",
    UNKNOWN = "unknown"
}
export declare enum WebOrientation {
    PORTRAIT_PRIMARY = "portrait-primary",
    PORTRAIT_SECONDARY = "portrait-secondary",
    LANDSCAPE_PRIMARY = "landscape-primary",
    LANDSCAPE_SECONDARY = "landscape-secondary"
}
export declare type PlatformOrientationInfo = {
    screenOrientationConstantAndroid?: number;
    screenOrientationArrayIOS?: Orientation[];
    screenOrientationLockWeb?: WebOrientationLock;
};
export declare type OrientationChangeListener = (event: OrientationChangeEvent) => void;
export declare type OrientationChangeEvent = {
    orientationLock: OrientationLock;
    orientation: Orientation;
};
