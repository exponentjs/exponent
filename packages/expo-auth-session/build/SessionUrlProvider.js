import { Platform } from '@unimodules/react-native-adapter';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Linking from 'expo-linking';
import { resolveScheme } from 'expo-linking/build/Schemes';
import qs from 'qs';
export class SessionUrlProvider {
    getDefaultReturnUrl(urlPath, options) {
        const queryParams = SessionUrlProvider.getHostAddressQueryParams();
        let path = SessionUrlProvider.SESSION_PATH;
        if (urlPath) {
            path = [path, SessionUrlProvider.removeLeadingSlash(urlPath)].filter(Boolean).join('/');
        }
        return Linking.createURL(path, {
            // The redirect URL doesn't matter for the proxy as long as it's valid, so silence warnings if needed.
            scheme: options?.scheme ?? resolveScheme({ isSilent: true }),
            queryParams,
            isTripleSlashed: options?.isTripleSlashed,
        });
    }
    getStartUrl(authUrl, returnUrl) {
        if (Platform.OS === 'web' && !Platform.isDOMAvailable) {
            // Return nothing in SSR envs
            return '';
        }
        const queryString = qs.stringify({
            authUrl,
            returnUrl,
        });
        return `${this.getRedirectUrl()}/start?${queryString}`;
    }
    getRedirectUrl(urlPath) {
        if (Platform.OS === 'web') {
            if (Platform.isDOMAvailable) {
                return [window.location.origin, urlPath].filter(Boolean).join('/');
            }
            else {
                // Return nothing in SSR envs
                return '';
            }
        }
        const legacyExpoProjectId = Constants.manifest?.originalFullName ||
            Constants.manifest2?.extra?.expoClient?.originalFullName ||
            Constants.manifest?.id;
        if (!legacyExpoProjectId) {
            let nextSteps = '';
            if (__DEV__) {
                if (Constants.executionEnvironment === ExecutionEnvironment.Bare) {
                    nextSteps =
                        ' Please ensure you have the latest version of expo-constants installed and rebuild your native app. You can verify that originalFullName is defined by running `expo config --type public` and inspecting the output.';
                }
                else if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
                    nextSteps =
                        ' Please report this as a bug with the contents of `expo config --type public`.';
                }
            }
            throw new Error('Cannot use AuthSession proxy because the project ID is not defined.' + nextSteps);
        }
        const redirectUrl = `${SessionUrlProvider.BASE_URL}/${legacyExpoProjectId}`;
        if (__DEV__) {
            SessionUrlProvider.warnIfAnonymous(legacyExpoProjectId, redirectUrl);
            // TODO: Verify with the dev server that the manifest is up to date.
        }
        return redirectUrl;
    }
    static getHostAddressQueryParams() {
        let hostUri = Constants.manifest?.hostUri ?? Constants.manifest2?.extra?.expoClient?.hostUri;
        if (!hostUri &&
            (ExecutionEnvironment.StoreClient === Constants.executionEnvironment || resolveScheme({}))) {
            if (!Constants.linkingUri) {
                hostUri = '';
            }
            else {
                // we're probably not using up-to-date xdl, so just fake it for now
                // we have to remove the /--/ on the end since this will be inserted again later
                hostUri = SessionUrlProvider.removeScheme(Constants.linkingUri).replace(/\/--(\/.*)?$/, '');
            }
        }
        if (!hostUri) {
            return undefined;
        }
        const uriParts = hostUri?.split('?');
        try {
            return qs.parse(uriParts?.[1]);
        }
        catch { }
        return undefined;
    }
    static warnIfAnonymous(id, url) {
        if (id.startsWith('@anonymous/')) {
            console.warn(`You are not currently signed in to Expo on your development machine. As a result, the redirect URL for AuthSession will be "${url}". If you are using an OAuth provider that requires adding redirect URLs to an allow list, we recommend that you do not add this URL -- instead, you should sign in to Expo to acquire a unique redirect URL. Additionally, if you do decide to publish this app using Expo, you will need to register an account to do it.`);
        }
    }
    static removeScheme(url) {
        return url.replace(/^[a-zA-Z0-9+.-]+:\/\//, '');
    }
    static removeLeadingSlash(url) {
        return url.replace(/^\//, '');
    }
}
SessionUrlProvider.BASE_URL = `https://auth.expo.io`;
SessionUrlProvider.SESSION_PATH = 'expo-auth-session';
export default new SessionUrlProvider();
//# sourceMappingURL=SessionUrlProvider.js.map