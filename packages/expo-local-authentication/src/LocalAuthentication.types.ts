export type LocalAuthenticationResult = { success: true } | { success: false; error: string; message: string };

export enum AuthenticationType {
  FINGERPRINT = 1,
  FACIAL_RECOGNITION = 2,
  // Android only
  IRIS = 3,
}

export enum SecurityLevel {
  NONE = 0,
  SECRET = 1,
  BIOMETRIC = 2,
}

export type LocalAuthenticationOptions = {
  promptMessage?: string;
  cancelLabel?: string;
  disableDeviceFallback?: boolean;
  // iOS only
  fallbackLabel?: string;
};
