export default {
    get name() {
        return 'ExpoLocalAuthentication';
    },
    async isAvailableAsync() {
        return false;
    },
    async hasHardwareAsync() {
        return false;
    },
    async isEnrolledAsync() {
        return false;
    },
    async supportedAuthenticationTypesAsync() {
        return [];
    },
};
//# sourceMappingURL=ExpoLocalAuthentication.web.js.map