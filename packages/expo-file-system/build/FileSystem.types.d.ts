export declare enum FileSystemSessionType {
    BACKGROUND = 0,
    FOREGROUND = 1
}
export declare enum FileSystemUploadType {
    BINARY_CONTENT = 0,
    MULTIPART = 1
}
export declare type DownloadOptions = {
    md5?: boolean;
    cache?: boolean;
    headers?: Record<string, string>;
    sessionType?: FileSystemSessionType;
};
export declare type FileSystemHttpResult = {
    headers: Record<string, string>;
    status: number;
    mimeType: string | null;
};
export declare type FileSystemDownloadResult = FileSystemHttpResult & {
    uri: string;
    md5?: string;
};
/**
 * @deprecated Use `FileSystemDownloadResult` instead.
 */
export declare type DownloadResult = FileSystemDownloadResult;
export declare type FileSystemUploadOptions = ({
    uploadType?: FileSystemUploadType.BINARY_CONTENT;
} | {
    uploadType: FileSystemUploadType.MULTIPART;
    fieldName?: string;
    mimeType?: string;
    parameters?: Record<string, string>;
}) & {
    headers?: Record<string, string>;
    httpMethod?: FileSystemAcceptedUploadHttpMethod;
    sessionType?: FileSystemSessionType;
};
export declare type FileSystemUploadResult = FileSystemHttpResult & {
    body: string;
};
export declare type NetworkTaskProgressCallback<T extends DownloadProgressData | UploadProgressData> = (data: T) => void;
/**
 * @deprecated use `NetworkTaskProgressCallback<DownloadProgressData>` instead
 */
export declare type DownloadProgressCallback = NetworkTaskProgressCallback<DownloadProgressData>;
export declare type DownloadProgressData = {
    totalBytesWritten: number;
    totalBytesExpectedToWrite: number;
};
export declare type UploadProgressData = {
    totalByteSent: number;
    totalBytesExpectedToSend: number;
};
export declare type DownloadPauseState = {
    url: string;
    fileUri: string;
    options: DownloadOptions;
    resumeData?: string;
};
export declare type FileInfo = {
    exists: true;
    uri: string;
    size: number;
    isDirectory: boolean;
    modificationTime: number;
    md5?: string;
} | {
    exists: false;
    uri: string;
    size: undefined;
    isDirectory: false;
    modificationTime: undefined;
    md5: undefined;
};
export declare enum EncodingType {
    UTF8 = "utf8",
    Base64 = "base64"
}
export declare type FileSystemAcceptedUploadHttpMethod = 'POST' | 'PUT' | 'PATCH';
export declare type ReadingOptions = {
    encoding?: EncodingType | 'utf8' | 'base64';
    position?: number;
    length?: number;
};
export declare type WritingOptions = {
    encoding?: EncodingType | 'utf8' | 'base64';
};
export declare type ProgressEvent<T> = {
    uuid: string;
    data: T;
};
export declare type FileSystemRequestDirectoryPermissionsResult = {
    granted: true;
    directoryUri: string;
} | {
    granted: false;
};
declare type PlatformMethod = (...args: any[]) => Promise<any>;
export interface ExponentFileSystemModule {
    readonly name: 'ExponentFileSystem';
    readonly documentDirectory: string | null;
    readonly cacheDirectory: string | null;
    readonly bundledAssets: string | null;
    readonly bundleDirectory: string | null;
    readonly getInfoAsync?: PlatformMethod;
    readonly readAsStringAsync?: PlatformMethod;
    readonly writeAsStringAsync?: PlatformMethod;
    readonly deleteAsync?: PlatformMethod;
    readonly moveAsync?: PlatformMethod;
    readonly copyAsync?: PlatformMethod;
    readonly makeDirectoryAsync?: PlatformMethod;
    readonly readDirectoryAsync?: PlatformMethod;
    readonly downloadAsync?: PlatformMethod;
    readonly uploadAsync?: PlatformMethod;
    readonly downloadResumableStartAsync?: PlatformMethod;
    readonly downloadResumablePauseAsync?: PlatformMethod;
    readonly getContentUriAsync?: PlatformMethod;
    readonly getFreeDiskStorageAsync?: PlatformMethod;
    readonly getTotalDiskCapacityAsync?: PlatformMethod;
    readonly requestDirectoryPermissionsAsync?: PlatformMethod;
    readonly readSAFDirectoryAsync?: PlatformMethod;
    readonly makeSAFDirectoryAsync?: PlatformMethod;
    readonly createSAFFileAsync?: PlatformMethod;
    readonly networkTaskCancelAsync?: PlatformMethod;
    readonly uploadTaskStartAsync?: PlatformMethod;
    startObserving?: () => void;
    stopObserving?: () => void;
    addListener: (eventName: string) => void;
    removeListeners: (count: number) => void;
}
export {};
