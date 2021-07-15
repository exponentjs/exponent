import Constants from 'expo-constants';
export function getDefaultWebOptions() {
    return (Constants.manifest?.web?.config?.firebase ??
        Constants.manifest2?.extra?.expoClient?.web?.config?.firebase);
}
//# sourceMappingURL=FirebaseOptions.js.map