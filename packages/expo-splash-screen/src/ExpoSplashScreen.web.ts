export default {
  get name(): string {
    return 'ExpoSplashScreen';
  },
  setSplashScreenAutoHideEnabled(enabled: boolean) {
    return false;
  },
  preventAutoHideAsync() {
    return false;
  },
  hideAsync() {
    return false;
  },
};
