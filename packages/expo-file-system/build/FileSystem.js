import { EventEmitter, UnavailabilityError } from '@unimodules/core';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import ExponentFileSystem from './ExponentFileSystem';
import { EncodingType, FileSystemSessionType, FileSystemUploadType, } from './FileSystem.types';
if (!ExponentFileSystem) {
    console.warn("No native ExponentFileSystem module found, are you sure the expo-file-system's module is linked properly?");
}
// Prevent webpack from pruning this.
const _unused = new EventEmitter(ExponentFileSystem); // eslint-disable-line
export { EncodingType, FileSystemSessionType, FileSystemUploadType, };
function normalizeEndingSlash(p) {
    if (p != null) {
        return p.replace(/\/*$/, '') + '/';
    }
    return null;
}
export const documentDirectory = normalizeEndingSlash(ExponentFileSystem.documentDirectory);
export const cacheDirectory = normalizeEndingSlash(ExponentFileSystem.cacheDirectory);
export const { bundledAssets, bundleDirectory } = ExponentFileSystem;
export async function getInfoAsync(fileUri, options = {}) {
    if (!ExponentFileSystem.getInfoAsync) {
        throw new UnavailabilityError('expo-file-system', 'getInfoAsync');
    }
    return await ExponentFileSystem.getInfoAsync(fileUri, options);
}
export async function readAsStringAsync(fileUri, options) {
    if (!ExponentFileSystem.readAsStringAsync) {
        throw new UnavailabilityError('expo-file-system', 'readAsStringAsync');
    }
    return await ExponentFileSystem.readAsStringAsync(fileUri, options || {});
}
export async function getContentUriAsync(fileUri) {
    if (Platform.OS === 'android') {
        if (!ExponentFileSystem.getContentUriAsync) {
            throw new UnavailabilityError('expo-file-system', 'getContentUriAsync');
        }
        return await ExponentFileSystem.getContentUriAsync(fileUri);
    }
    else {
        return new Promise(function (resolve, reject) {
            resolve(fileUri);
        });
    }
}
export async function writeAsStringAsync(fileUri, contents, options = {}) {
    if (!ExponentFileSystem.writeAsStringAsync) {
        throw new UnavailabilityError('expo-file-system', 'writeAsStringAsync');
    }
    return await ExponentFileSystem.writeAsStringAsync(fileUri, contents, options);
}
export async function deleteAsync(fileUri, options = {}) {
    if (!ExponentFileSystem.deleteAsync) {
        throw new UnavailabilityError('expo-file-system', 'deleteAsync');
    }
    return await ExponentFileSystem.deleteAsync(fileUri, options);
}
export async function deleteLegacyDocumentDirectoryAndroid() {
    if (Platform.OS !== 'android' || documentDirectory == null) {
        return;
    }
    const legacyDocumentDirectory = `${documentDirectory}ExperienceData/`;
    return await deleteAsync(legacyDocumentDirectory, { idempotent: true });
}
export async function moveAsync(options) {
    if (!ExponentFileSystem.moveAsync) {
        throw new UnavailabilityError('expo-file-system', 'moveAsync');
    }
    return await ExponentFileSystem.moveAsync(options);
}
export async function copyAsync(options) {
    if (!ExponentFileSystem.copyAsync) {
        throw new UnavailabilityError('expo-file-system', 'copyAsync');
    }
    return await ExponentFileSystem.copyAsync(options);
}
export async function makeDirectoryAsync(fileUri, options = {}) {
    if (!ExponentFileSystem.makeDirectoryAsync) {
        throw new UnavailabilityError('expo-file-system', 'makeDirectoryAsync');
    }
    return await ExponentFileSystem.makeDirectoryAsync(fileUri, options);
}
export async function readDirectoryAsync(fileUri) {
    if (!ExponentFileSystem.readDirectoryAsync) {
        throw new UnavailabilityError('expo-file-system', 'readDirectoryAsync');
    }
    return await ExponentFileSystem.readDirectoryAsync(fileUri, {});
}
export async function getFreeDiskStorageAsync() {
    if (!ExponentFileSystem.getFreeDiskStorageAsync) {
        throw new UnavailabilityError('expo-file-system', 'getFreeDiskStorageAsync');
    }
    return await ExponentFileSystem.getFreeDiskStorageAsync();
}
export async function getTotalDiskCapacityAsync() {
    if (!ExponentFileSystem.getTotalDiskCapacityAsync) {
        throw new UnavailabilityError('expo-file-system', 'getTotalDiskCapacityAsync');
    }
    return await ExponentFileSystem.getTotalDiskCapacityAsync();
}
export async function downloadAsync(uri, fileUri, options = {}) {
    if (!ExponentFileSystem.downloadAsync) {
        throw new UnavailabilityError('expo-file-system', 'downloadAsync');
    }
    return await ExponentFileSystem.downloadAsync(uri, fileUri, {
        sessionType: FileSystemSessionType.BACKGROUND,
        ...options,
    });
}
export async function uploadAsync(url, fileUri, options = {}) {
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
export function createDownloadResumable(uri, fileUri, options, callback, resumeData) {
    return new DownloadResumable(uri, fileUri, options, callback, resumeData);
}
export function createUploadTask(url, fileUri, options, callback) {
    return new UploadTask(url, fileUri, options, callback);
}
export class NetworkTask {
    constructor() {
        this._uuid = uuidv4();
        this.taskWasCanceled = false;
        this.emitter = new EventEmitter(ExponentFileSystem);
    }
    async cancelAsync() {
        if (!ExponentFileSystem.networkTaskCancelAsync) {
            throw new UnavailabilityError('expo-file-system', 'networkTaskCancelAsync');
        }
        this.removeSubscription();
        this.taskWasCanceled = true;
        return await ExponentFileSystem.networkTaskCancelAsync(this.uuid);
    }
    checkIfTaskWasCanceled() {
        if (this.taskWasCanceled) {
            console.warn('This task was already canceled.');
            return true;
        }
        return false;
    }
    get uuid() {
        return this._uuid;
    }
    addSubscription() {
        if (this.subscription) {
            return;
        }
        this.subscription = this.emitter.addListener(this.getEventName(), (event) => {
            if (event.uuid === this.uuid) {
                const callback = this.getCallback();
                if (callback) {
                    callback(event.data);
                }
            }
        });
    }
    removeSubscription() {
        if (!this.subscription) {
            return;
        }
        this.emitter.removeSubscription(this.subscription);
        this.subscription = null;
    }
}
export class UploadTask extends NetworkTask {
    constructor(url, fileUri, options, callback) {
        super();
        this.url = url;
        this.fileUri = fileUri;
        this.callback = callback;
        const httpMethod = (options?.httpMethod?.toUpperCase ||
            'POST');
        this.options = {
            sessionType: FileSystemSessionType.BACKGROUND,
            uploadType: FileSystemUploadType.BINARY_CONTENT,
            ...options,
            httpMethod,
        };
    }
    getEventName() {
        return 'expo-file-system.uploadProgress';
    }
    getCallback() {
        return this.callback;
    }
    async uploadAsync() {
        if (!ExponentFileSystem.uploadTaskStartAsync) {
            throw new UnavailabilityError('expo-file-system', 'uploadTaskStartAsync');
        }
        if (this.checkIfTaskWasCanceled()) {
            return undefined;
        }
        this.addSubscription();
        const result = await ExponentFileSystem.uploadTaskStartAsync(this.url, this.fileUri, this.uuid, this.options);
        this.removeSubscription();
        return result;
    }
}
export class DownloadResumable extends NetworkTask {
    constructor(url, _fileUri, options = {}, callback, resumeData) {
        super();
        this.url = url;
        this._fileUri = _fileUri;
        this.options = options;
        this.callback = callback;
        this.resumeData = resumeData;
    }
    get fileUri() {
        return this._fileUri;
    }
    getEventName() {
        return 'expo-file-system.downloadProgress';
    }
    getCallback() {
        return this.callback;
    }
    async downloadAsync() {
        if (!ExponentFileSystem.downloadResumableStartAsync) {
            throw new UnavailabilityError('expo-file-system', 'downloadResumableStartAsync');
        }
        if (this.checkIfTaskWasCanceled()) {
            return undefined;
        }
        this.addSubscription();
        return await ExponentFileSystem.downloadResumableStartAsync(this.url, this._fileUri, this.uuid, this.options, this.resumeData);
    }
    async pauseAsync() {
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
        }
        else {
            throw new Error('Unable to generate a savable pause state');
        }
    }
    async resumeAsync() {
        if (!ExponentFileSystem.downloadResumableStartAsync) {
            throw new UnavailabilityError('expo-file-system', 'downloadResumableStartAsync');
        }
        if (this.checkIfTaskWasCanceled()) {
            return undefined;
        }
        this.addSubscription();
        return await ExponentFileSystem.downloadResumableStartAsync(this.url, this.fileUri, this.uuid, this.options, this.resumeData);
    }
    savable() {
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
export var StorageAccessFramework;
(function (StorageAccessFramework) {
    function getUriForDirectoryInRoot(folderName) {
        return `content://com.android.externalstorage.documents/tree/primary:${folderName}/document/primary:${folderName}`;
    }
    StorageAccessFramework.getUriForDirectoryInRoot = getUriForDirectoryInRoot;
    async function requestDirectoryPermissionsAsync(initialFileUrl = null) {
        if (!ExponentFileSystem.requestDirectoryPermissionsAsync) {
            throw new UnavailabilityError('expo-file-system', 'StorageAccessFramework.requestDirectoryPermissionsAsync');
        }
        return await ExponentFileSystem.requestDirectoryPermissionsAsync(initialFileUrl);
    }
    StorageAccessFramework.requestDirectoryPermissionsAsync = requestDirectoryPermissionsAsync;
    async function readDirectoryAsync(dirUri) {
        if (!ExponentFileSystem.readSAFDirectoryAsync) {
            throw new UnavailabilityError('expo-file-system', 'StorageAccessFramework.readDirectoryAsync');
        }
        return await ExponentFileSystem.readSAFDirectoryAsync(dirUri, {});
    }
    StorageAccessFramework.readDirectoryAsync = readDirectoryAsync;
    async function makeDirectoryAsync(parentUri, dirName) {
        if (!ExponentFileSystem.makeSAFDirectoryAsync) {
            throw new UnavailabilityError('expo-file-system', 'StorageAccessFramework.makeDirectoryAsync');
        }
        return await ExponentFileSystem.makeSAFDirectoryAsync(parentUri, dirName);
    }
    StorageAccessFramework.makeDirectoryAsync = makeDirectoryAsync;
    async function createFileAsync(parentUri, fileName, mimeType) {
        if (!ExponentFileSystem.createSAFFileAsync) {
            throw new UnavailabilityError('expo-file-system', 'StorageAccessFramework.createFileAsync');
        }
        return await ExponentFileSystem.createSAFFileAsync(parentUri, fileName, mimeType);
    }
    StorageAccessFramework.createFileAsync = createFileAsync;
    StorageAccessFramework.writeAsStringAsync = baseWriteAsStringAsync;
    StorageAccessFramework.readAsStringAsync = baseReadAsStringAsync;
    StorageAccessFramework.deleteAsync = baseDeleteAsync;
    StorageAccessFramework.moveAsync = baseMoveAsync;
    StorageAccessFramework.copyAsync = baseCopyAsync;
})(StorageAccessFramework || (StorageAccessFramework = {}));
//# sourceMappingURL=FileSystem.js.map