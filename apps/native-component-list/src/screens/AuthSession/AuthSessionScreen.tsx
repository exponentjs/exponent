import { H2, H4 } from '@expo/html-elements';
import * as AuthSession from 'expo-auth-session';
import { useAuthRequest } from 'expo-auth-session';
import * as FacebookAuthSession from 'expo-auth-session/providers/facebook';
import * as GoogleAuthSession from 'expo-auth-session/providers/google';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { maybeCompleteAuthSession } from 'expo-web-browser';
import React from 'react';
import { Platform, ScrollView, View } from 'react-native';

import { getGUID } from '../../api/guid';
import TitledPicker from '../../components/TitledPicker';
import TitledSwitch from '../../components/TitledSwitch';
import { AuthSection } from './AuthResult';
import LegacyAuthSession from './LegacyAuthSession';

maybeCompleteAuthSession();

const isInClient = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const languages = [
  { key: 'en', value: 'English' },
  { key: 'pl', value: 'Polish' },
  { key: 'nl', value: 'Dutch' },
  { key: 'fi', value: 'Finnish' },
];
export default function AuthSessionScreen() {
  const [useProxy, setProxy] = React.useState<boolean>(false);
  const [usePKCE, setPKCE] = React.useState<boolean>(true);
  const [prompt, setSwitch] = React.useState<undefined | AuthSession.Prompt>(undefined);
  const [language, setLanguage] = React.useState<any>(languages[0].key);

  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 12,
          ...Platform.select({
            default: {
              maxWidth: '100%',
            },
            web: {
              maxWidth: 640,
            },
          }),
        }}>
        <View style={{ marginBottom: 8 }}>
          <H2>Settings</H2>
          <TitledSwitch
            title="Use Proxy"
            disabled={Platform.OS === 'web'}
            value={useProxy}
            setValue={setProxy}
          />
          <TitledSwitch
            title="Switch Accounts"
            value={!!prompt}
            setValue={value => setSwitch(value ? AuthSession.Prompt.SelectAccount : undefined)}
          />
          <TitledSwitch title="Use PKCE" value={usePKCE} setValue={setPKCE} />
          <TitledPicker
            items={languages}
            title="Language"
            value={language}
            setValue={setLanguage}
          />
          <H4>
            ID:{' '}
            {Constants.manifest?.originalFullName ||
              Constants.manifest2?.extra?.expoClient?.originalFullName ||
              Constants.manifest?.id ||
              'unset'}
          </H4>
        </View>
        <H2>Services</H2>
        <AuthSessionProviders
          prompt={prompt}
          usePKCE={usePKCE}
          useProxy={useProxy}
          language={language}
        />
        <H2>Legacy</H2>
        <LegacyAuthSession />
      </ScrollView>
    </View>
  );
}

AuthSessionScreen.navigationOptions = {
  title: 'AuthSession',
};

function AuthSessionProviders(props: {
  useProxy: boolean;
  usePKCE: boolean;
  prompt?: AuthSession.Prompt;
  language: string;
}) {
  const { useProxy, usePKCE, prompt, language } = props;

  const redirectUri = AuthSession.makeRedirectUri({
    path: 'redirect',
    preferLocalhost: Platform.select({ android: false, default: true }),
    useProxy,
  });

  const options = {
    useProxy,
    usePKCE,
    prompt,
    redirectUri,
    language,
  };

  const providers = [
    Google,
    GoogleFirebase,
    Facebook,
    Imgur,
    Spotify,
    Strava,
    Twitch,
    Dropbox,
    Reddit,
    Github,
    Coinbase,
    Uber,
    Slack,
    FitBit,
    Okta,
    Identity,
    // Azure,
  ];
  return (
    <View style={{ flex: 1 }}>
      {providers.map((Provider, index) => (
        <Provider key={`-${index}`} {...options} />
      ))}
    </View>
  );
}

function Google({ prompt, language, usePKCE }: any) {
  const [request, result, promptAsync] = GoogleAuthSession.useAuthRequest(
    {
      language,
      expoClientId: '629683148649-qevd4mfvh06q14i4nl453r62sgd1p85d.apps.googleusercontent.com',
      clientId: `${getGUID()}.apps.googleusercontent.com`,
      selectAccount: !!prompt,
      usePKCE,
    },
    {
      path: 'redirect',
      preferLocalhost: true,
    }
  );

  React.useEffect(() => {
    if (request && result?.type === 'success') {
      console.log('Result: ', result.authentication);
    }
  }, [result]);

  return (
    <AuthSection
      request={request}
      title="google"
      result={result}
      promptAsync={() => promptAsync()}
    />
  );
}

function GoogleFirebase({ prompt, language, usePKCE }: any) {
  const [request, result, promptAsync] = GoogleAuthSession.useIdTokenAuthRequest(
    {
      language,
      expoClientId: '629683148649-qevd4mfvh06q14i4nl453r62sgd1p85d.apps.googleusercontent.com',
      clientId: `${getGUID()}.apps.googleusercontent.com`,
      selectAccount: !!prompt,
      usePKCE,
    },
    {
      path: 'redirect',
      preferLocalhost: true,
    }
  );

  React.useEffect(() => {
    if (request && result?.type === 'success') {
      console.log('Result:', result.params.id_token);
    }
  }, [result]);

  return (
    <AuthSection
      request={request}
      title="google_firebase"
      result={result}
      promptAsync={() => promptAsync()}
    />
  );
}

// Couldn't get this working. API is really confusing.
// function Azure({ useProxy, prompt, usePKCE }: any) {
//   const redirectUri = AuthSession.makeRedirectUri({
//     path: 'redirect',
//     preferLocalhost: true,
//     useProxy,
//     native: Platform.select<string>({
//       ios: 'msauth.dev.expo.Payments://auth',
//       android: 'msauth://dev.expo.payments/sZs4aocytGUGvP1%2BgFAavaPMPN0%3D',
//     }),
//   });

//   // 'https://login.microsoftonline.com/your-tenant-id/v2.0',
//   const discovery = AuthSession.useAutoDiscovery(
//     'https://login.microsoftonline.com/f8cdef31-a31e-4b4a-93e4-5f571e91255a/v2.0'
//   );
//   const [request, result, promptAsync] = useAuthRequest(
//     // config
//     {
//       clientId: '96891596-721b-4ae1-8e67-674809373165',
//       redirectUri,
//       prompt,
//       extraParams: {
//         domain_hint: 'live.com',
//       },
//       // redirectUri: 'msauth.{bundleId}://auth',
//       scopes: ['openid', 'profile', 'email', 'offline_access'],
//       usePKCE,
//     },
//     // discovery
//     discovery
//   );

//   return (
//     <AuthSection
//       title="azure"
//       disabled={isInClient}
//       request={request}
//       result={result}
//       promptAsync={promptAsync}
//       useProxy={useProxy}
//     />
//   );
// }

function Okta({ redirectUri, usePKCE, useProxy }: any) {
  const discovery = AuthSession.useAutoDiscovery('https://dev-720924.okta.com/oauth2/default');
  const [request, result, promptAsync] = useAuthRequest(
    {
      clientId: '0oa4su9fhp4F2F4Eg4x6',
      redirectUri,
      scopes: ['openid', 'profile'],
      usePKCE,
    },
    discovery
  );

  return (
    <AuthSection
      title="okta"
      request={request}
      result={result}
      promptAsync={promptAsync}
      useProxy={useProxy}
    />
  );
}

// Reddit only allows one redirect uri per client Id
// We'll only support bare, and proxy in this example
// If the redirect is invalid with http instead of https on web, then the provider
// will let you authenticate but it will redirect with no data and the page will appear broken.
function Reddit({ redirectUri, prompt, usePKCE, useProxy }: any) {
  let clientId: string;

  if (isInClient) {
    if (useProxy) {
      // Using the proxy in the client.
      // This expects the URI to be 'https://auth.expo.io/@community/native-component-list'
      // so you'll need to be signed into community or be using the public demo
      clientId = 'IlgcZIpcXF1eKw';
    } else {
      // // Normalize the host to `localhost` for other testers
      clientId = 'CPc_adCUQGt9TA';
    }
  } else {
    if (Platform.OS === 'web') {
      // web apps with uri scheme `https://localhost:19006`
      clientId = '9k_oYNO97ly-5w';
    } else {
      // Native bare apps with uri scheme `bareexpo`
      clientId = '2OFsAA7h63LQJQ';
    }
  }

  const [request, result, promptAsync] = useAuthRequest(
    {
      clientId,
      clientSecret: '',
      redirectUri,
      prompt,
      scopes: ['identity'],
      usePKCE,
    },
    {
      authorizationEndpoint: 'https://www.reddit.com/api/v1/authorize.compact',
      tokenEndpoint: 'https://www.reddit.com/api/v1/access_token',
    }
  );

  return (
    <AuthSection
      title="reddit"
      request={request}
      result={result}
      promptAsync={promptAsync}
      useProxy={useProxy}
    />
  );
}

// Imgur Docs https://api.imgur.com/oauth2
// Create app https://api.imgur.com/oauth2/addclient
function Imgur({ redirectUri, prompt, usePKCE, useProxy }: any) {
  let clientId: string;

  if (isInClient) {
    if (useProxy) {
      // Using the proxy in the client.
      // This expects the URI to be 'https://auth.expo.io/@community/native-component-list'
      // so you'll need to be signed into community or be using the public demo
      clientId = '5287e6c03ffac8b';
    } else {
      // Normalize the host to `localhost` for other testers
      // Expects: exp://127.0.0.1:19000/--/redirect
      clientId = '7ab2f3cc75427a0';
    }
  } else {
    if (Platform.OS === 'web') {
      // web apps with uri scheme `https://localhost:19006`
      clientId = '181b22d17a3743e';
    } else {
      // Native bare apps with uri scheme `bareexpo`
      clientId = 'd839d91135a16cc';
    }
  }

  const [request, result, promptAsync] = useAuthRequest(
    {
      clientId,
      responseType: AuthSession.ResponseType.Token,
      redirectUri,
      scopes: [],
      usePKCE,
      prompt,
    },
    // discovery
    {
      authorizationEndpoint: 'https://api.imgur.com/oauth2/authorize',
      tokenEndpoint: 'https://api.imgur.com/oauth2/token',
    }
  );

  return (
    <AuthSection
      title="imgur"
      request={request}
      result={result}
      promptAsync={() => promptAsync({ useProxy, windowFeatures: { width: 500, height: 750 } })}
      useProxy={useProxy}
    />
  );
}

// TODO: Add button to test using an invalid redirect URI. This is a good example of AuthError.
// Works for all platforms
function Github({ redirectUri, prompt, usePKCE, useProxy }: any) {
  let clientId: string;

  if (isInClient) {
    if (useProxy) {
      // Using the proxy in the client.
      clientId = '2e4298cafc7bc93ceab8';
    } else {
      clientId = '7eb5d82d8f160a434564';
    }
  } else {
    if (Platform.OS === 'web') {
      // web apps
      clientId = 'fd9b07204f9d325e8f0e';
    } else {
      // Native bare apps with uri scheme `bareexpo`
      clientId = '498f1fae3ae16f066f34';
    }
  }

  const [request, result, promptAsync] = useAuthRequest(
    {
      clientId,
      redirectUri,
      scopes: ['identity'],
      usePKCE,
      prompt,
    },
    // discovery
    {
      authorizationEndpoint: 'https://github.com/login/oauth/authorize',
      tokenEndpoint: 'https://github.com/login/oauth/access_token',
      revocationEndpoint:
        'https://github.com/settings/connections/applications/d529db5d7d81c2d50adf',
    }
  );

  return (
    <AuthSection
      title="github"
      request={request}
      result={result}
      promptAsync={() => promptAsync({ useProxy, windowFeatures: { width: 500, height: 750 } })}
      useProxy={useProxy}
    />
  );
}

// I couldn't get access to any scopes
// This never returns to the app after authenticating
function Uber({ redirectUri, prompt, usePKCE, useProxy }: any) {
  // https://developer.uber.com/docs/riders/guides/authentication/introduction
  const [request, result, promptAsync] = useAuthRequest(
    {
      clientId: 'kTpT4xf8afVxifoWjx5Nhn-IFamZKp2x',
      redirectUri,
      scopes: [],
      usePKCE,
      prompt,
      // Enable to test invalid_scope error
      // scopes: ['invalid'],
    },
    // discovery
    {
      authorizationEndpoint: 'https://login.uber.com/oauth/v2/authorize',
      tokenEndpoint: 'https://login.uber.com/oauth/v2/token',
      revocationEndpoint: 'https://login.uber.com/oauth/v2/revoke',
    }
  );

  return (
    <AuthSection
      title="uber"
      request={request}
      result={result}
      promptAsync={promptAsync}
      useProxy={useProxy}
    />
  );
}

// https://dev.fitbit.com/apps/new
// Easy to setup
// Only allows one redirect URI per app (clientId)
// Refresh doesn't seem to return a new access token :[
function FitBit({ redirectUri, prompt, usePKCE, useProxy }: any) {
  let clientId: string;

  if (isInClient) {
    if (useProxy) {
      // Using the proxy in the client.
      clientId = '22BNXR';
    } else {
      // Client without proxy
      clientId = '22BNXX';
    }
  } else {
    if (Platform.OS === 'web') {
      // web apps with uri scheme `https://localhost:19006`
      clientId = '22BNXQ';
    } else {
      // Native bare apps with uri scheme `bareexpo`
      clientId = '22BGYS';
    }
  }

  const [request, result, promptAsync] = useAuthRequest(
    {
      clientId,
      redirectUri,
      scopes: ['activity', 'sleep'],
      prompt,
      usePKCE,
    },
    // discovery
    {
      authorizationEndpoint: 'https://www.fitbit.com/oauth2/authorize',
      tokenEndpoint: 'https://api.fitbit.com/oauth2/token',
      revocationEndpoint: 'https://api.fitbit.com/oauth2/revoke',
    }
  );

  return (
    <AuthSection
      title="fitbit"
      request={request}
      result={result}
      promptAsync={promptAsync}
      useProxy={useProxy}
    />
  );
}

function Facebook({ usePKCE, useProxy, language }: any) {
  const [request, result, promptAsync] = FacebookAuthSession.useAuthRequest(
    {
      clientId: '145668956753819',
      usePKCE,
      language,
      scopes: ['user_likes'],
    },
    {
      path: 'redirect',
      preferLocalhost: true,
      useProxy,
    }
  );
  // Add fetch user example

  return (
    <AuthSection
      title="facebook"
      request={request}
      result={result}
      promptAsync={() => promptAsync()}
    />
  );
}

function Slack({ redirectUri, prompt, usePKCE, useProxy }: any) {
  // https://api.slack.com/apps
  // After you created an app, navigate to [Features > OAuth & Permissions]
  // - Add a redirect URI Under [Redirect URLs]
  // - Under [Scopes] add the scopes you want to request from the user
  // Next go to [App Credentials] to get your client ID and client secret
  // No refresh token or expiration is returned, assume the token lasts forever.
  const [request, result, promptAsync] = useAuthRequest(
    // config
    {
      clientId: '58692702102.1023025401076',
      redirectUri,
      scopes: ['emoji:read'],
      prompt,
      usePKCE,
    },
    // discovery
    {
      authorizationEndpoint: 'https://slack.com/oauth/authorize',
      tokenEndpoint: 'https://slack.com/api/oauth.access',
    }
  );

  return (
    <AuthSection
      title="slack"
      request={request}
      result={result}
      promptAsync={promptAsync}
      useProxy={useProxy}
    />
  );
}

// Works on all platforms
function Spotify({ redirectUri, prompt, usePKCE, useProxy }: any) {
  const [request, result, promptAsync] = useAuthRequest(
    {
      clientId: 'a946eadd241244fd88d0a4f3d7dea22f',
      redirectUri,
      scopes: ['user-read-email', 'playlist-modify-public', 'user-read-private'],
      usePKCE,
      extraParams: {
        show_dialog: 'false',
      },
      prompt,
    },
    // discovery
    {
      authorizationEndpoint: 'https://accounts.spotify.com/authorize',
      tokenEndpoint: 'https://accounts.spotify.com/api/token',
    }
  );

  return (
    <AuthSection
      title="spotify"
      request={request}
      result={result}
      promptAsync={promptAsync}
      useProxy={useProxy}
    />
  );
}

function Strava({ redirectUri, prompt, usePKCE, useProxy }: any) {
  const discovery = {
    authorizationEndpoint: 'https://www.strava.com/oauth/mobile/authorize',
    tokenEndpoint: 'https://www.strava.com/oauth/token',
  };
  const [request, result, promptAsync] = useAuthRequest(
    {
      clientId: '51935',
      redirectUri,
      scopes: ['activity:read_all'],
      usePKCE,
      prompt,
    },
    discovery
  );

  React.useEffect(() => {
    if (request && result?.type === 'success' && result.params.code) {
      AuthSession.exchangeCodeAsync(
        {
          clientId: request?.clientId,
          redirectUri,
          code: result.params.code,
          extraParams: {
            // You must use the extraParams variation of clientSecret.
            client_secret: `...`,
          },
        },
        discovery
      ).then(result => {
        console.log('RES: ', result);
      });
    }
  }, [result]);

  return (
    <AuthSection
      title="strava"
      request={request}
      result={result}
      promptAsync={promptAsync}
      useProxy={useProxy}
    />
  );
}

// Works on all platforms
function Identity({ redirectUri, prompt, useProxy }: any) {
  const discovery = AuthSession.useAutoDiscovery('https://demo.identityserver.io');

  const [request, result, promptAsync] = useAuthRequest(
    {
      clientId: 'native.code',
      redirectUri,
      prompt,
      scopes: ['openid', 'profile', 'email', 'offline_access'],
    },
    discovery
  );

  return (
    <AuthSection
      title="identity4"
      request={request}
      result={result}
      promptAsync={promptAsync}
      useProxy={useProxy}
    />
  );
}

// Doesn't work with proxy
function Coinbase({ redirectUri, prompt, usePKCE, useProxy }: any) {
  const [request, result, promptAsync] = useAuthRequest(
    {
      clientId: '13b2bc8d9114b1cb6d0132cf60c162bc9c2d5ec29c2599003556edf81cc5db4e',
      redirectUri,
      prompt,
      usePKCE,
      scopes: ['wallet:accounts:read'],
    },
    // discovery
    {
      authorizationEndpoint: 'https://www.coinbase.com/oauth/authorize',
      tokenEndpoint: 'https://api.coinbase.com/oauth/token',
      revocationEndpoint: 'https://api.coinbase.com/oauth/revoke',
    }
  );

  return (
    <AuthSection
      disabled={useProxy}
      title="coinbase"
      request={request}
      result={result}
      promptAsync={promptAsync}
      useProxy={useProxy}
    />
  );
}

function Dropbox({ redirectUri, prompt, usePKCE, useProxy }: any) {
  const [request, result, promptAsync] = useAuthRequest(
    {
      clientId: 'pjvyj0c5kxxrsfs',
      redirectUri,
      prompt,
      usePKCE,
      scopes: [],
      responseType: AuthSession.ResponseType.Token,
    },
    // discovery
    {
      authorizationEndpoint: 'https://www.dropbox.com/oauth2/authorize',
      tokenEndpoint: 'https://www.dropbox.com/oauth2/token',
    }
  );

  return (
    <AuthSection
      disabled={usePKCE}
      title="dropbox"
      request={request}
      result={result}
      promptAsync={promptAsync}
      useProxy={useProxy}
    />
  );
}

function Twitch({ redirectUri, prompt, usePKCE, useProxy }: any) {
  const [request, result, promptAsync] = useAuthRequest(
    {
      clientId: 'r7jomrc4hiz5wm1wgdzmwr1ccb454h',
      redirectUri,
      prompt,
      scopes: ['openid', 'user_read', 'analytics:read:games'],
      usePKCE,
    },
    {
      authorizationEndpoint: 'https://id.twitch.tv/oauth2/authorize',
      tokenEndpoint: 'https://id.twitch.tv/oauth2/token',
      revocationEndpoint: 'https://id.twitch.tv/oauth2/revoke',
    }
  );

  return (
    <AuthSection
      disabled={useProxy}
      title="twitch"
      request={request}
      result={result}
      promptAsync={promptAsync}
      useProxy={useProxy}
    />
  );
}
