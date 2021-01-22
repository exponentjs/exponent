import { AuthenticationType } from './LocalAuthentication.types';

export default {
  get name(): string {
    return 'ExpoLocalAuthentication';
  },
  async isAvailableAsync(): Promise<false> {
    return false;
  },
  async hasHardwareAsync(): Promise<boolean> {
    return false;
  },
  async isEnrolledAsync(): Promise<boolean> {
    return false;
  },
  async supportedAuthenticationTypesAsync(): Promise<AuthenticationType[]> {
    return [];
  },
};
