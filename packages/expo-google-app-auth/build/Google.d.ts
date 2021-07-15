export declare type GoogleLogInConfig = {
    /**
     * Used in the Expo Play Store client app on Android (development only).
     *
     * - Create an Android OAuth Client ID from the [Credentials Page](https://console.developers.google.com/apis/credentials).
     * - Run `openssl rand -base64 32 | openssl sha1 -c` in your terminal, it will output a string that looks like A1:B2:C3 but longer.
     * - Paste the output from the previous step into the "Signing-certificate fingerprint" text field.
     * - Use `host.exp.exponent` as the "Package name".
     */
    androidClientId?: string;
    /**
     * Used in the Expo App Store client app on iOS (development only).
     *
     * - Select "iOS Application" as the Application Type from the [Credentials Page](https://console.developers.google.com/apis/credentials).
     * - Use `host.exp.exponent` as the bundle identifier.
     */
    iosClientId?: string;
    /**
     * Used in your custom Android app (production).
     * Visit the docs page [Deploying to a standalone app on Android](https://docs.expo.io/versions/latest/sdk/google/#deploying-to-a-standalone-app-on-android) for more info.
     */
    androidStandaloneAppClientId?: string;
    /**
     * Used in your custom iOS app (production).
     * Visit the docs page [Deploying to a standalone app on iOS](https://docs.expo.io/versions/latest/sdk/google/#deploying-to-a-standalone-app-on-ios) for more info.
     */
    iosStandaloneAppClientId?: string;
    /**
     * @deprecated [learn more here](https://docs.expo.io/versions/latest/sdk/google/#server-side-apis).
     */
    webClientId?: string;
    /**
     * System authentication is very different from web auth.
     * All system functionality has been moved to expo-google-sign-in
     */
    behavior?: 'system' | 'web';
    scopes?: string[];
    /**
     * Optionally you can define your own redirect URL.
     * If this isn't defined then it will be infered from the correct client ID.
     */
    redirectUrl?: string;
    /**
     * Language for the sign in UI, in the form of ISO 639-1 language code optionally followed by a dash
     * and ISO 3166-1 alpha-2 region code, such as 'it' or 'pt-PT'.
     * Only set this value if it's different from the system default (which you can access via expo-localization).
     */
    language?: string;
    /**
     * If the user's email address is known ahead of time, it can be supplied to be the default option.
     * If the user has approved access for this app in the past then auth may return without any further interaction.
     */
    loginHint?: string;
    /**
     * If no other client IDs are defined this will be used.
     */
    clientId?: string;
};
export declare type GoogleUser = {
    id?: string;
    name?: string;
    givenName?: string;
    familyName?: string;
    photoUrl?: string;
    email?: string;
};
export declare type LogInResult = {
    type: 'cancel';
} | {
    type: 'success';
    accessToken: string | null;
    accessTokenExpirationDate: string | null;
    idToken: string | null;
    refreshToken: string | null;
    user: GoogleUser;
};
export declare function getPlatformGUID(config: GoogleLogInConfig): string;
/**
 * Prompts the user to log into Google and grants your app permission to access some of their Google data, as specified by the scopes.
 *
 * Get started in:
 * - [**Expo Client**](https://docs.expo.io/versions/latest/sdk/google/#using-it-inside-of-the-expo-app)
 * - [**Standalone**](https://docs.expo.io/versions/latest/sdk/google/#deploying-to-a-standalone-app-on-ios)
 *
 * @param config
 */
export declare function logInAsync(config: GoogleLogInConfig): Promise<LogInResult>;
export declare function logOutAsync({ accessToken, ...inputConfig }: GoogleLogInConfig & {
    accessToken: string;
}): Promise<any>;
