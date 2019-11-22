import { PermissionResponse, PermissionStatus } from 'unimodules-permissions-interface';
export declare const MediaTypeOptions: {
    readonly All: "All";
    readonly Videos: "Videos";
    readonly Images: "Images";
};
export declare enum ExportPresets {
    LowQuality = 0,
    MediumQuality = 1,
    HighestQuality = 2,
    Passthrough = 3,
    H264_640x480 = 4,
    H264_960x540 = 5,
    H264_1280x720 = 6,
    H264_1920x1080 = 7,
    H264_3840x2160 = 8,
    HEVC_1920x1080 = 9,
    HEVC_3840x2160 = 10
}
export declare type ImageInfo = {
    uri: string;
    width: number;
    height: number;
    type?: 'image' | 'video';
    exif?: {
        [key: string]: any;
    };
    base64?: string;
};
export declare type ImagePickerResult = {
    cancelled: true;
} | ({
    cancelled: false;
} & ImageInfo);
export declare type ImagePickerOptions = {
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
    allowsMultipleSelection?: boolean;
    mediaTypes?: typeof MediaTypeOptions[keyof typeof MediaTypeOptions];
    exif?: boolean;
    base64?: boolean;
    exportPreset?: typeof ExportPresets[keyof typeof ExportPresets];
};
export declare type OpenFileBrowserOptions = {
    mediaTypes: typeof MediaTypeOptions[keyof typeof MediaTypeOptions];
    capture?: boolean;
    allowsMultipleSelection: boolean;
};
export { PermissionResponse, PermissionStatus };
