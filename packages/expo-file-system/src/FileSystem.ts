import { EventEmitter, Subscription, UnavailabilityError } from '@unimodules/core';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

import ExponentFileSystem from './ExponentFileSystem';
import {
  DownloadOptions,
  DownloadPauseState,
  DownloadProgressCallback,
  NetworkTaskProgressCallback,
  DownloadProgressData,
  UploadProgressData,
  DownloadResult,
  EncodingType,
  FileInfo,
  FileSystemAcceptedUploadHttpMethod,
  FileSystemDownloadResult,
  FileSystemRequestDirectoryPermissionsResult,
  FileSystemSessionType,
  FileSystemUploadOptions,
  FileSystemUploadResult,
  FileSystemUploadType,
  ProgressEvent,
  ReadingOptions,
  WritingOptions,
} from './FileSystem.types';

if (!ExponentFileSystem) {
  console.warn(
    "No native ExponentFileSystem module found, are you sure the expo-file-system's module is linked properly?"
  );
}
// Prevent webpack from pruning this.
const _unused = new EventEmitter(ExponentFileSystem); // eslint-disable-line

export {
  DownloadOptions,
  DownloadPauseState,
  DownloadProgressCallback,
  DownloadProgressData,
  DownloadResult,
  EncodingType,
  FileInfo,
  FileSystemDownloadResult,
  FileSystemRequestDirectoryPermissionsResult,
  FileSystemAcceptedUploadHttpMethod,
  FileSystemSessionType,
  FileSystemUploadOptions,
  FileSystemUploadResult,
  FileSystemUploadType,
  ReadingOptions,
  WritingOptions,
};

function normalizeEndingSlash(p: string | null): string | null {
  if (p != null) {
    return p.replace(/\/*$/, '') + '/';
  }
  return null;
}

export const documentDirectory = normalizeEndingSlash(ExponentFileSystem.documentDirectory);
export const cacheDirectory = normalizeEndingSlash(ExponentFileSystem.cacheDirectory);

export const { bundledAssets, bundleDirectory } = ExponentFileSystem;

export async function getInfoAsync(
  fileUri: string,
  options: { md5?: boolean; size?: boolean } = {}
): Promise<FileInfo> {
  if (!ExponentFileSystem.getInfoAsync) {
    throw new UnavailabilityError('expo-file-system', 'getInfoAsync');
  }
  return await ExponentFileSystem.getInfoAsync(fileUri, options);
}

export async function readAsStringAsync(
  fileUri: string,
  options?: ReadingOptions
): Promise<string> {
  if (!ExponentFileSystem.readAsStringAsync) {
    throw new UnavailabilityError('expo-file-system', 'readAsStringAsync');
  }
  return await ExponentFileSystem.readAsStringAsync(fileUri, options || {});
}

export async function getContentUriAsync(fileUri: string): Promise<string> {
  if (Platform.OS === 'android') {
    if (!ExponentFileSystem.getContentUriAsync) {
      throw new UnavailabilityError('expo-file-system', 'getContentUriAsync');
    }
    return await ExponentFileSystem.getContentUriAsync(fileUri);
  } else {
    return new Promise(function(resolve, reject) {
      resolve(fileUri);
    });
  }
}

export async function writeAsStringAsync(
  fileUri: string,
  contents: string,
  options: WritingOptions = {}
): Promise<void> {
  if (!ExponentFileSystem.writeAsStringAsync) {
    throw new UnavailabilityError('expo-file-system', 'writeAsStringAsync');
  }
  return await ExponentFileSystem.writeAsStringAsync(fileUri, contents, options);
}

export async function deleteAsync(
  fileUri: string,
  options: { idempotent?: boolean } = {}
): Promise<void> {
  if (!ExponentFileSystem.deleteAsync) {
    throw new UnavailabilityError('expo-file-system', 'deleteAsync');
  }
  return await ExponentFileSystem.deleteAsync(fileUri, options);
}

export async function deleteLegacyDocumentDirectoryAndroid(): Promise<void> {
  if (Platform.OS !== 'android' || documentDirectory == null) {
    return;
  }
  const legacyDocumentDirectory = `${documentDirectory}ExperienceData/`;
  return await deleteAsync(legacyDocumentDirectory, { idempotent: true });
}

export async function moveAsync(options: { from: string; to: string }): Promise<void> {
  if (!ExponentFileSystem.moveAsync) {
    throw new UnavailabilityError('expo-file-system', 'moveAsync');
  }
  return await ExponentFileSystem.moveAsync(options);
}

export async function copyAsync(options: { from: string; to: string }): Promise<void> {
  if (!ExponentFileSystem.copyAsync) {
    throw new UnavailabilityError('expo-file-system', 'copyAsync');
  }
  return await ExponentFileSystem.copyAsync(options);
}

export async function makeDirectoryAsync(
  fileUri: string,
  options: { intermediates?: boolean } = {}
): Promise<void> {
  if (!ExponentFileSystem.makeDirectoryAsync) {
    throw new UnavailabilityError('expo-file-system', 'makeDirectoryAsync');
  }
  return await ExponentFileSystem.makeDirectoryAsync(fileUri, options);
}

export async function readDirectoryAsync(fileUri: string): Promise<string[]> {
  if (!ExponentFileSystem.readDirectoryAsync) {
    throw new UnavailabilityError('expo-file-system', 'readDirectoryAsync');
  }
  return await ExponentFileSystem.readDirectoryAsync(fileUri, {});
}

export async function getFreeDiskStorageAsync(): Promise<number> {
  if (!ExponentFileSystem.getFreeDiskStorageAsync) {
    throw new UnavailabilityError('expo-file-system', 'getFreeDiskStorageAsync');
  }
  return await ExponentFileSystem.getFreeDiskStorageAsync();
}

export async function getTotalDiskCapacityAsync(): Promise<number> {
  if (!ExponentFileSystem.getTotalDiskCapacityAsync) {
    throw new UnavailabilityError('expo-file-system', 'getTotalDiskCapacityAsync');
  }
  return await ExponentFileSystem.getTotalDiskCapacityAsync();
}

export async function downloadAsync(
  uri: string,
  fileUri: string,
  options: DownloadOptions = {}
): Promise<FileSystemDownloadResult> {
  if (!ExponentFileSystem.downloadAsync) {
    throw new UnavailabilityError('expo-file-system', 'downloadAsync');
  }

  return await ExponentFileSystem.downloadAsync(uri, fileUri, {
    sessionType: FileSystemSessionType.BACKGROUND,
    ...options,
  });
}

export async function uploadAsync(
  url: string,
  fileUri: string,
  options: FileSystemUploadOptions = {}
): Promise<FileSystemUploadResult> {
  if (!ExponentFileSystem.uploadAsync) {
    throw new UnavailabilityError('expo-file-system', 'uploadAsync');
  }

  return await ExponentFileSystem.uploadAsync(url, fileUri, {
    sessionType: FileSystemSessionType.BACKGROUND,
    uploadType: FileSystemUploadType.BINARY_CONTENT,
    ...options,
    httpMethod: (options.httpMethod || 'POST').toUpperCase(),
  });
}

export function createDownloadResumable(
  uri: string,
  fileUri: string,
  options?: DownloadOptions,
  callback?: NetworkTaskProgressCallback<DownloadProgressData>,
  resumeData?: string
): DownloadResumable {
  return new DownloadResumable(uri, fileUri, options, callback, resumeData);
}

export function createUploadTask(
  url: string,
  fileUri: string,
  options?: FileSystemUploadOptions,
  callback?: NetworkTaskProgressCallback<UploadProgressData>
): UploadTask {
  return new UploadTask(url, fileUri, options, callback);
}

export abstract class NetworkTask<T extends DownloadProgressData | UploadProgressData> {
  private _uuid = uuidv4();
  protected taskWasCanceled = false;
  private emitter = new EventEmitter(ExponentFileSystem);
  private subscription?: Subscription | null;

  public async cancelAsync(): Promise<void> {
    if (!ExponentFileSystem.networkTaskCancelAsync) {
      throw new UnavailabilityError('expo-file-system', 'networkTaskCancelAsync');
    }

    this.removeSubscription();
    this.taskWasCanceled = true;
    return await ExponentFileSystem.networkTaskCancelAsync(this.uuid);
  }

  protected checkIfTaskWasCanceled(): boolean {
    if (this.taskWasCanceled) {
      console.warn('This task was already canceled.');
      return true;
    }

    return false;
  }

  protected get uuid(): string {
    return this._uuid;
  }

  protected abstract getEventName(): string;

  protected abstract getCallback(): NetworkTaskProgressCallback<T> | undefined;

  protected addSubscription() {
    if (this.subscription) {
      return;
    }

    this.subscription = this.emitter.addListener(this.getEventName(), (event: ProgressEvent<T>) => {
      if (event.uuid === this.uuid) {
        const callback = this.getCallback();
        if (callback) {
          callback(event.data);
        }
      }
    });
  }

  protected removeSubscription() {
    if (!this.subscription) {
      return;
    }
    this.emitter.removeSubscription(this.subscription);
    this.subscription = null;
  }
}

export class UploadTask extends NetworkTask<UploadProgressData> {
  private options: FileSystemUploadOptions;

  constructor(
    private url: string,
    private fileUri: string,
    options?: FileSystemUploadOptions,
    private callback?: NetworkTaskProgressCallback<UploadProgressData>
  ) {
    super();

    const httpMethod = (options?.httpMethod?.toUpperCase ||
      'POST') as FileSystemAcceptedUploadHttpMethod;

    this.options = {
      sessionType: FileSystemSessionType.BACKGROUND,
      uploadType: FileSystemUploadType.BINARY_CONTENT,
      ...options,
      httpMethod,
    };
  }

  protected getEventName(): string {
    return 'expo-file-system.uploadProgress';
  }
  protected getCallback(): NetworkTaskProgressCallback<UploadProgressData> | undefined {
    return this.callback;
  }

  public async uploadAsync(): Promise<FileSystemUploadResult | undefined> {
    if (!ExponentFileSystem.uploadTaskStartAsync) {
      throw new UnavailabilityError('expo-file-system', 'uploadTaskStartAsync');
    }

    if (this.checkIfTaskWasCanceled()) {
      return undefined;
    }

    this.addSubscription();
    const result = await ExponentFileSystem.uploadTaskStartAsync(
      this.url,
      this.fileUri,
      this.uuid,
      this.options
    );
    this.removeSubscription();

    return result;
  }
}

export class DownloadResumable extends NetworkTask<DownloadProgressData> {
  constructor(
    private url: string,
    private _fileUri: string,
    private options: DownloadOptions = {},
    private callback?: NetworkTaskProgressCallback<DownloadProgressData>,
    private resumeData?: string
  ) {
    super();
  }

  public get fileUri(): string {
    return this._fileUri;
  }

  protected getEventName(): string {
    return 'expo-file-system.downloadProgress';
  }

  protected getCallback(): NetworkTaskProgressCallback<DownloadProgressData> | undefined {
    return this.callback;
  }

  async downloadAsync(): Promise<FileSystemDownloadResult | undefined> {
    if (!ExponentFileSystem.downloadResumableStartAsync) {
      throw new UnavailabilityError('expo-file-system', 'downloadResumableStartAsync');
    }

    if (this.checkIfTaskWasCanceled()) {
      return undefined;
    }

    this.addSubscription();
    return await ExponentFileSystem.downloadResumableStartAsync(
      this.url,
      this._fileUri,
      this.uuid,
      this.options,
      this.resumeData
    );
  }

  async pauseAsync(): Promise<DownloadPauseState> {
    if (!ExponentFileSystem.downloadResumablePauseAsync) {
      throw new UnavailabilityError('expo-file-system', 'downloadResumablePauseAsync');
    }

    if (this.checkIfTaskWasCanceled()) {
      return {
        fileUri: this._fileUri,
        options: this.options,
        url: this.url,
      };
    }

    const pauseResult = await ExponentFileSystem.downloadResumablePauseAsync(this.uuid);
    this.removeSubscription();
    if (pauseResult) {
      this.resumeData = pauseResult.resumeData;
      return this.savable();
    } else {
      throw new Error('Unable to generate a savable pause state');
    }
  }

  async resumeAsync(): Promise<FileSystemDownloadResult | undefined> {
    if (!ExponentFileSystem.downloadResumableStartAsync) {
      throw new UnavailabilityError('expo-file-system', 'downloadResumableStartAsync');
    }

    if (this.checkIfTaskWasCanceled()) {
      return undefined;
    }

    this.addSubscription();
    return await ExponentFileSystem.downloadResumableStartAsync(
      this.url,
      this.fileUri,
      this.uuid,
      this.options,
      this.resumeData
    );
  }

  savable(): DownloadPauseState {
    return {
      url: this.url,
      fileUri: this.fileUri,
      options: this.options,
      resumeData: this.resumeData,
    };
  }
}

const baseReadAsStringAsync = readAsStringAsync;
const baseWriteAsStringAsync = writeAsStringAsync;
const baseDeleteAsync = deleteAsync;
const baseMoveAsync = moveAsync;
const baseCopyAsync = copyAsync;
/**
 * Android only
 */
export namespace StorageAccessFramework {
  export function getUriForDirectoryInRoot(folderName: string) {
    return `content://com.android.externalstorage.documents/tree/primary:${folderName}/document/primary:${folderName}`;
  }

  export async function requestDirectoryPermissionsAsync(
    initialFileUrl: string | null = null
  ): Promise<FileSystemRequestDirectoryPermissionsResult> {
    if (!ExponentFileSystem.requestDirectoryPermissionsAsync) {
      throw new UnavailabilityError(
        'expo-file-system',
        'StorageAccessFramework.requestDirectoryPermissionsAsync'
      );
    }

    return await ExponentFileSystem.requestDirectoryPermissionsAsync(initialFileUrl);
  }

  export async function readDirectoryAsync(dirUri: string): Promise<string[]> {
    if (!ExponentFileSystem.readSAFDirectoryAsync) {
      throw new UnavailabilityError(
        'expo-file-system',
        'StorageAccessFramework.readDirectoryAsync'
      );
    }
    return await ExponentFileSystem.readSAFDirectoryAsync(dirUri, {});
  }

  export async function makeDirectoryAsync(parentUri: string, dirName: string): Promise<string> {
    if (!ExponentFileSystem.makeSAFDirectoryAsync) {
      throw new UnavailabilityError(
        'expo-file-system',
        'StorageAccessFramework.makeDirectoryAsync'
      );
    }
    return await ExponentFileSystem.makeSAFDirectoryAsync(parentUri, dirName);
  }

  export async function createFileAsync(
    parentUri: string,
    fileName: string,
    mimeType: string
  ): Promise<string> {
    if (!ExponentFileSystem.createSAFFileAsync) {
      throw new UnavailabilityError('expo-file-system', 'StorageAccessFramework.createFileAsync');
    }
    return await ExponentFileSystem.createSAFFileAsync(parentUri, fileName, mimeType);
  }

  export const writeAsStringAsync = baseWriteAsStringAsync;
  export const readAsStringAsync = baseReadAsStringAsync;
  export const deleteAsync = baseDeleteAsync;
  export const moveAsync = baseMoveAsync;
  export const copyAsync = baseCopyAsync;
}
