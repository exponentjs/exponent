export enum FileSystemSessionType {
  /*
   * Using this mode means that the downloading/uploading session on the native side will work even if the application is moved to background.
   *
   * If the task completes while the application is in background, the Promise will be either resolved immediately or (if the application execution has already been stopped) once the app is moved to foreground again.
   */
  BACKGROUND = 0,
  /*
   * Using this mode means that downloading/uploading session on the native side will be terminated once the application becomes inactive (e.g. when it goes to background).
   * Bringing the application to foreground again would trigger Promise rejection.
   */
  FOREGROUND = 1,
}

export enum FileSystemUploadType {
  BINARY_CONTENT = 0,
  MULTIPART = 1,
}

export type DownloadOptions = {
  md5?: boolean;
  cache?: boolean;
  headers?: Record<string, string>;
  /*
   * iOS only
   */
  sessionType?: FileSystemSessionType;
};

export type FileSystemHttpResult = {
  headers: Record<string, string>;
  status: number;
  mimeType: string | null;
};

export type FileSystemDownloadResult = FileSystemHttpResult & {
  uri: string;
  md5?: string;
};

/**
 * @deprecated Use `FileSystemDownloadResult` instead.
 */
export type DownloadResult = FileSystemDownloadResult;

export type FileSystemUploadOptions = (
  | {
      uploadType?: FileSystemUploadType.BINARY_CONTENT;
    }
  | {
      uploadType: FileSystemUploadType.MULTIPART;
      fieldName?: string;
      mimeType?: string;
      parameters?: Record<string, string>;
    }
) & {
  headers?: Record<string, string>;
  httpMethod?: FileSystemAcceptedUploadHttpMethod;
  sessionType?: FileSystemSessionType;
};

export type FileSystemUploadResult = FileSystemHttpResult & {
  body: string;
};

export type NetworkTaskProgressCallback<T extends DownloadProgressData | UploadProgressData> = (
  data: T
) => void;

/**
 * @deprecated use `NetworkTaskProgressCallback<DownloadProgressData>` instead
 */
export type DownloadProgressCallback = NetworkTaskProgressCallback<DownloadProgressData>;

export type DownloadProgressData = {
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
};

export type UploadProgressData = {
  totalByteSent: number;
  totalBytesExpectedToSend: number;
};

export type DownloadPauseState = {
  url: string;
  fileUri: string;
  options: DownloadOptions;
  resumeData?: string;
};

export type FileInfo =
  | {
      exists: true;
      uri: string;
      size: number;
      isDirectory: boolean;
      modificationTime: number;
      md5?: string;
    }
  | {
      exists: false;
      uri: string;
      size: undefined;
      isDirectory: false;
      modificationTime: undefined;
      md5: undefined;
    };

export enum EncodingType {
  UTF8 = 'utf8',
  Base64 = 'base64',
}

export type FileSystemAcceptedUploadHttpMethod = 'POST' | 'PUT' | 'PATCH';

export type ReadingOptions = {
  encoding?: EncodingType | 'utf8' | 'base64';
  position?: number;
  length?: number;
};

export type WritingOptions = {
  encoding?: EncodingType | 'utf8' | 'base64';
};

export type ProgressEvent<T> = {
  uuid: string;
  data: T;
};

export type FileSystemRequestDirectoryPermissionsResult =
  | {
      granted: true;
      directoryUri: string;
    }
  | {
      granted: false;
    };

type PlatformMethod = (...args: any[]) => Promise<any>;

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
