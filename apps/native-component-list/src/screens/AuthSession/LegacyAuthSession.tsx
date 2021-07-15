import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import Button from '../../components/Button';
import { AuthResult } from './AuthResult';
const isInClient = Platform.OS !== 'web' && Constants.appOwnership === 'expo';

/**
 * Converts an object to a query string.
 */
function toQueryString(params: object) {
  return (
    '?' +
    Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')
  );
}

/**
 * Test the `AuthSession.startAsync` functionality.
 */
export default function LegacyAuthSession() {
  const [result, setResult] = React.useState<any | null>(null);
  const id =
    Constants.manifest?.originalFullName ??
    Constants.manifest2?.extra?.expoClient?.originalFullName ??
    Constants.manifest?.id;
  const isInvalid = id !== '@community/native-component-list';

  if (isInvalid) {
    return (
      <View style={styles.container}>
        <Text style={styles.oopsTitle}>Hello, developer person!</Text>
        <Text style={styles.oopsText}>
          The experience id {id} will not work with this due to the authorized callback URL
          configuration on Auth0{' '}
        </Text>
        <Text style={styles.oopsText}>
          Sign in as @community to use this example, or change the Auth0 client id and domain in
          AuthSessionScreen.js
        </Text>
        {isInClient && (
          <Text style={styles.faintText}>Return Url: {AuthSession.getDefaultReturnUrl()}</Text>
        )}
      </View>
    );
  }
  const redirectUrl = AuthSession.getRedirectUrl();
  const auth0Domain = 'https://expo-testing.auth0.com';
  const authUrl =
    `${auth0Domain}/authorize` +
    toQueryString({
      client_id: '8wmGum25h3KU2grnmZtFvMQeitmIdSDS',
      response_type: 'token',
      scope: 'openid name',
      redirect_uri: redirectUrl,
    });

  const handlePressAsync = async () => {
    const result = await AuthSession.startAsync({ authUrl });
    setResult(result);
  };

  return (
    <View>
      <Button title="Authenticate using an external service" onPress={handlePressAsync} />
      <AuthResult title="Legacy" result={result} />
      <Text style={styles.faintText}>Auth Url: {authUrl}</Text>
      <Text style={styles.faintText}>Return Url: {AuthSession.getDefaultReturnUrl()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
    flexWrap: 'wrap',
  },
  button: {
    marginVertical: 16,
  },
  text: {
    marginVertical: 15,
    maxWidth: '80%',
    marginHorizontal: 10,
  },
  faintText: {
    color: '#888',
    marginHorizontal: 30,
  },
  oopsTitle: {
    fontSize: 25,
    marginBottom: 5,
    textAlign: 'center',
  },
  oopsText: {
    textAlign: 'center',
    marginTop: 10,
    marginHorizontal: 30,
  },
});
