import { ViewProps } from 'react-native';
import {
  PermissionResponse,
  PermissionStatus,
  PermissionExpiration,
} from 'unimodules-permissions-interface';

export type CameraPictureOptions = {
  quality?: number;
  base64?: boolean;
  exif?: boolean;
  skipProcessing?: boolean;
  onPictureSaved?: Function;
  // internal
  id?: number;
  fastMode?: boolean;
};

export type CameraRecordingOptions = {
  maxDuration?: number;
  maxFileSize?: number;
  quality?: number | string;
  mute?: boolean;
  mirror?: boolean;
};

export type CameraCapturedPicture = {
  width: number;
  height: number;
  uri: string;
  base64?: string;
  exif?: any;
};

export type CameraMountError = { message: string };

export type BarCodeScanningResult = { type: string; data: string };

export type FaceDetectionResult = { faces: any[] };

export type BarCodeScanErrorResult = { error: { code: string; message: string } };

export type CameraProps = ViewProps & {
  zoom?: number;
  ratio?: string;
  focusDepth?: number;
  type?: number | string;
  onCameraReady?: Function;
  useCamera2Api?: boolean;
  flashMode?: number | string;
  whiteBalance?: number | string;
  autoFocus?: string | boolean | number;
  pictureSize?: string;
  videoStabilizationMode?: number;
  onMountError?: (event: CameraMountError) => void;
  barCodeScannerSettings?: object;
  onBarCodeScanned?: (scanningResult: BarCodeScanningResult) => void;
  faceDetectorSettings?: object;
  onFacesDetected?: (faces: FaceDetectionResult) => void;
};

export type CameraNativeProps = {
  pointerEvents?: any;
  style?: any;
  ref?: Function;
  onCameraReady?: Function;
  onMountError?: ({ nativeEvent }: { nativeEvent: CameraMountError }) => void;
  onBarCodeScanned?: ({ nativeEvent }: { nativeEvent: BarCodeScanningResult }) => void;
  onBarCodeScanError?: ({ nativeEvent }: { nativeEvent: BarCodeScanErrorResult }) => void;
  onFacesDetected?: ({ nativeEvent }: { nativeEvent: FaceDetectionResult }) => void;
  onFaceDetectionError?: Function;
  onPictureSaved?: Function;
  type?: number | string;
  flashMode?: number | string;
  autoFocus?: string | boolean | number;
  focusDepth?: number;
  zoom?: number;
  whiteBalance?: number | string;
  pictureSize?: string;
  barCodeScannerSettings?: object;
  barCodeScannerEnabled?: boolean;
  faceDetectorEnabled?: boolean;
  faceDetectorSettings?: object;
  // Android
  ratio?: string;
  useCamera2Api?: boolean;
};

export { PermissionResponse, PermissionStatus, PermissionExpiration };
