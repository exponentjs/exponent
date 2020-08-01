import { PermissionStatus, PermissionExpiration } from 'unimodules-permissions-interface';
import { CameraPermissionResponse, CameraRollPermissionResponse, ImagePickerResult, MediaTypeOptions, ImagePickerOptions, VideoExportPreset, ExpandImagePickerResult, ExpandImagePickerOptions } from './ImagePicker.types';
export declare function getCameraPermissionsAsync(): Promise<CameraPermissionResponse>;
export declare function getCameraRollPermissionsAsync(): Promise<CameraRollPermissionResponse>;
export declare function requestCameraPermissionsAsync(): Promise<CameraPermissionResponse>;
export declare function requestCameraRollPermissionsAsync(): Promise<CameraRollPermissionResponse>;
export declare function launchCameraAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
export declare function launchImageLibraryAsync<T extends ExpandImagePickerOptions>(options: T): Promise<ExpandImagePickerResult<T>>;
export { MediaTypeOptions, ImagePickerOptions, ImagePickerResult, VideoExportPreset, CameraPermissionResponse, CameraRollPermissionResponse, PermissionStatus, PermissionExpiration, };