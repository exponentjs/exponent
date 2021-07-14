import { UnavailabilityError } from '@unimodules/core';

import ExpoFaceDetector from './ExpoFaceDetector';

type Point = { x: number; y: number };

export type FaceFeature = {
  bounds: {
    size: {
      width: number;
      height: number;
    };
    origin: Point;
  };
  smilingProbability?: number;
  leftEarPosition?: Point;
  rightEarPosition?: Point;
  leftEyePosition?: Point;
  leftEyeOpenProbability?: number;
  rightEyePosition?: Point;
  rightEyeOpenProbability?: number;
  leftCheekPosition?: Point;
  rightCheekPosition?: Point;
  leftMouthPosition?: Point;
  mouthPosition?: Point;
  rightMouthPosition?: Point;
  bottomMouthPosition?: Point;
  noseBasePosition?: Point;
  yawAngle?: number;
  rollAngle?: number;
  faceID?: number;
};

type ValuesOf<T extends any[]> = T[number];

export type FaceDetectorMode = string[];

export type FaceDetectorLandmarks = ValuesOf<typeof ExpoFaceDetector.Landmarks>;

export type FaceDetectorClassifications = ValuesOf<typeof ExpoFaceDetector.Classifications>;

export interface Image {
  uri: string;
  width: number;
  height: number;
  orientation: number;
}

export type DetectionOptions = {
  mode?: FaceDetectorMode;
  detectLandmarks?: FaceDetectorLandmarks;
  runClassifications?: FaceDetectorClassifications;
};

/**
 * Returns whether the Face Detection API is enabled on the current device. This does not check the app permissions.
 *
 * @returns Async `boolean`, indicating whether the Face Detection API is available on the current device. Currently this resolves `true` on iOS and Android only.
 */
export async function isAvailableAsync(): Promise<boolean> {
  return !!ExpoFaceDetector.detectFaces;
}

export async function detectFacesAsync(
  uri: string,
  options: DetectionOptions = {}
): Promise<{ faces: FaceFeature[]; image: Image }> {
  if (!ExpoFaceDetector.detectFaces) {
    throw new UnavailabilityError('expo-face-detector', 'detectFaces');
  }
  return await ExpoFaceDetector.detectFaces({ ...options, uri });
}

export const Constants = {
  Mode: ExpoFaceDetector.Mode,
  Landmarks: ExpoFaceDetector.Landmarks,
  Classifications: ExpoFaceDetector.Classifications,
};
