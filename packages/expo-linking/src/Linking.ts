import { Platform, UnavailabilityError } from '@unimodules/core';
import Constants from 'expo-constants';
import invariant from 'invariant';
import qs from 'qs';
import { useEffect, useState } from 'react';
import URL from 'url-parse';

import NativeLinking from './ExpoLinking';
import { CreateURLOptions, ParsedURL, QueryParams, URLListener } from './Linking.types';
import { hasCustomScheme, resolveScheme } from './Schemes';

function validateURL(url: string): void {
  invariant(typeof url === 'string', 'Invalid URL: should be a string. Was: ' + url);
  invariant(url, 'Invalid URL: cannot be empty');
}

function getHostUri(): string | null {
  if (Constants.manifest?.hostUri) {
    return Constants.manifest.hostUri;
  } else if (Constants.manifest2?.extra?.expoClient?.hostUri) {
    return Constants.manifest2.extra.expoClient.hostUri;
  } else if (!hasCustomScheme()) {
    // we're probably not using up-to-date xdl, so just fake it for now
    // we have to remove the /--/ on the end since this will be inserted again later
    return removeScheme(Constants.linkingUri).replace(/\/--($|\/.*$)/, '');
  } else {
    return null;
  }
}

function isExpoHosted(): boolean {
  const hostUri = getHostUri();
  return !!(
    hostUri &&
    (/^(.*\.)?(expo\.io|exp\.host|exp\.direct|expo\.test)(:.*)?(\/.*)?$/.test(hostUri) ||
      Constants.manifest?.developer)
  );
}

function removeScheme(url: string): string {
  return url.replace(/^[a-zA-Z0-9+.-]+:\/\//, '');
}

function removePort(url: string): string {
  return url.replace(/(?=([a-zA-Z0-9+.-]+:\/\/)?[^/]):\d+/, '');
}

function removeLeadingSlash(url: string): string {
  return url.replace(/^\//, '');
}

function removeTrailingSlashAndQueryString(url: string): string {
  return url.replace(/\/?\?.*$/, '');
}

function ensureLeadingSlash(input: string, shouldAppend: boolean): string {
  const hasSlash = input.endsWith('/');
  if (hasSlash && !shouldAppend) {
    return input.substring(0, input.length - 1);
  } else if (!hasSlash && shouldAppend) {
    return `${input}/`;
  }
  return input;
}

function ensureTrailingSlash(input: string, shouldAppend: boolean): string {
  const hasSlash = input.startsWith('/');
  if (hasSlash && !shouldAppend) {
    return input.substring(1);
  } else if (!hasSlash && shouldAppend) {
    return `/${input}`;
  }
  return input;
}

/**
 * Create a URL that works for the environment the app is currently running in.
 * The scheme in bare and standalone must be defined in the app.json under `expo.scheme`.
 *
 * **Examples**
 *
 * - Bare: empty string
 * - Standalone, Custom: `yourscheme:///path`
 * - Web (dev): `https://localhost:19006/path`
 * - Web (prod): `https://myapp.com/path`
 * - Expo Client (dev): `exp://128.0.0.1:19000/--/path`
 * - Expo Client (prod): `exp://exp.host/@yourname/your-app/--/path`
 *
 * @param path addition path components to append to the base URL.
 * @param queryParams An object of parameters that will be converted into a query string.
 */
export function makeUrl(path: string = '', queryParams?: QueryParams, scheme?: string): string {
  return createURL(path, { queryParams, scheme, isTripleSlashed: true });
}

/**
 * Create a URL that works for the environment the app is currently running in.
 * The scheme in bare and standalone must be defined in the Expo config (app.config.js or app.json) under `expo.scheme`.
 *
 * **Examples**
 *
 * - Bare: `<scheme>://path` -- uses provided scheme or scheme from Expo config `scheme`.
 * - Standalone, Custom: `yourscheme://path`
 * - Web (dev): `https://localhost:19006/path`
 * - Web (prod): `https://myapp.com/path`
 * - Expo Client (dev): `exp://128.0.0.1:19000/--/path`
 * - Expo Client (prod): `exp://exp.host/@yourname/your-app/--/path`
 *
 * @param path addition path components to append to the base URL.
 * @param scheme URI protocol `<scheme>://` that must be built into your native app.
 * @param queryParams An object of parameters that will be converted into a query string.
 */
export function createURL(
  path: string,
  { scheme, queryParams = {}, isTripleSlashed = false }: CreateURLOptions = {}
): string {
  if (Platform.OS === 'web') {
    if (!Platform.isDOMAvailable) return '';

    const origin = ensureLeadingSlash(window.location.origin, false);
    let queryString = qs.stringify(queryParams);
    if (queryString) {
      queryString = `?${queryString}`;
    }

    let outputPath = path;
    if (outputPath) outputPath = ensureTrailingSlash(path, true);

    return encodeURI(`${origin}${outputPath}${queryString}`);
  }

  const resolvedScheme = resolveScheme({ scheme });

  let hostUri = getHostUri() || '';

  if (hasCustomScheme() && isExpoHosted()) {
    hostUri = '';
  }

  if (path) {
    if (isExpoHosted() && hostUri) {
      path = `/--/${removeLeadingSlash(path)}`;
    }
    if (isTripleSlashed && !path.startsWith('/')) {
      path = `/${path}`;
    }
  } else {
    path = '';
  }

  // merge user-provided query params with any that were already in the hostUri
  // e.g. release-channel
  let queryString = '';
  const queryStringMatchResult = hostUri.match(/(.*)\?(.+)/);
  if (queryStringMatchResult) {
    hostUri = queryStringMatchResult[1];
    queryString = queryStringMatchResult[2];
    let paramsFromHostUri = {};
    try {
      const parsedParams = qs.parse(queryString);
      if (typeof parsedParams === 'object') {
        paramsFromHostUri = parsedParams;
      }
    } catch (e) {}
    queryParams = {
      ...queryParams,
      ...paramsFromHostUri,
    };
  }
  queryString = qs.stringify(queryParams);
  if (queryString) {
    queryString = `?${queryString}`;
  }

  hostUri = ensureTrailingSlash(hostUri, !isTripleSlashed);

  return encodeURI(
    `${resolvedScheme}:${isTripleSlashed ? '/' : ''}/${hostUri}${path}${queryString}`
  );
}

/**
 * Returns the components and query parameters for a given URL.
 *
 * @param url Input URL to parse
 */
export function parse(url: string): ParsedURL {
  validateURL(url);

  const parsed = URL(url, /* parseQueryString */ true);

  for (const param in parsed.query) {
    parsed.query[param] = decodeURIComponent(parsed.query[param]!);
  }
  const queryParams = parsed.query;

  const hostUri = getHostUri() || '';
  const hostUriStripped = removePort(removeTrailingSlashAndQueryString(hostUri));

  let path = parsed.pathname || null;
  let hostname = parsed.hostname || null;
  let scheme = parsed.protocol || null;

  if (scheme) {
    // Remove colon at end
    scheme = scheme.substring(0, scheme.length - 1);
  }

  if (path) {
    path = removeLeadingSlash(path);

    let expoPrefix: string | null = null;
    if (hostUriStripped) {
      const parts = hostUriStripped.split('/');
      expoPrefix = parts
        .slice(1)
        .concat(['--/'])
        .join('/');
    }

    if (isExpoHosted() && !hasCustomScheme() && expoPrefix && path.startsWith(expoPrefix)) {
      path = path.substring(expoPrefix.length);
      hostname = null;
    } else if (path.indexOf('+') > -1) {
      path = path.substring(path.indexOf('+') + 1);
    }
  }

  return {
    hostname,
    path,
    queryParams,
    scheme,
  };
}

/**
 * Add a handler to Linking changes by listening to the `url` event type
 * and providing the handler
 *
 * See https://reactnative.dev/docs/linking.html#addeventlistener
 */
export function addEventListener(type: string, handler: URLListener) {
  NativeLinking.addEventListener(type, handler);
}

/**
 * Remove a handler by passing the `url` event type and the handler.
 *
 * See https://reactnative.dev/docs/linking.html#removeeventlistener
 */
export function removeEventListener(type: string, handler: URLListener) {
  NativeLinking.removeEventListener(type, handler);
}

/**
 * **Native:** Parses the link that opened the app. If no link opened the app, all the fields will be \`null\`.
 * **Web:** Parses the current window URL.
 */
export async function parseInitialURLAsync(): Promise<ParsedURL> {
  const initialUrl = await NativeLinking.getInitialURL();
  if (!initialUrl) {
    return {
      scheme: null,
      hostname: null,
      path: null,
      queryParams: null,
    };
  }

  return parse(initialUrl);
}

/**
 * Launch an Android intent with optional extras
 *
 * @platform android
 */
export async function sendIntent(
  action: string,
  extras?: { key: string; value: string | number | boolean }[]
): Promise<void> {
  if (Platform.OS === 'android') {
    return await NativeLinking.sendIntent(action, extras);
  }
  throw new UnavailabilityError('Linking', 'sendIntent');
}

/**
 * Attempt to open the system settings for an the app.
 *
 * @platform ios
 */
export async function openSettings(): Promise<void> {
  if (Platform.OS === 'web') {
    throw new UnavailabilityError('Linking', 'openSettings');
  }
  if (NativeLinking.openSettings) {
    return await NativeLinking.openSettings();
  }
  await openURL('app-settings:');
}

/**
 * If the app launch was triggered by an app link,
 * it will give the link url, otherwise it will give `null`
 */
export async function getInitialURL(): Promise<string | null> {
  return (await NativeLinking.getInitialURL()) ?? null;
}

/**
 * Try to open the given `url` with any of the installed apps.
 */
export async function openURL(url: string): Promise<true> {
  validateURL(url);
  return await NativeLinking.openURL(url);
}

/**
 * Determine whether or not an installed app can handle a given URL.
 * On web this always returns true because there is no API for detecting what URLs can be opened.
 */
export async function canOpenURL(url: string): Promise<boolean> {
  validateURL(url);
  return await NativeLinking.canOpenURL(url);
}

/**
 * Returns the initial URL followed by any subsequent changes to the URL.
 */
export function useURL(): string | null {
  const [url, setLink] = useState<string | null>(null);

  function onChange(event: { url: string }) {
    setLink(event.url);
  }

  useEffect(() => {
    getInitialURL().then(url => setLink(url));
    addEventListener('url', onChange);
    return () => removeEventListener('url', onChange);
  }, []);

  return url;
}

/**
 * Returns the initial URL followed by any subsequent changes to the URL.
 * @deprecated Use `useURL` instead.
 */
export function useUrl(): string | null {
  console.warn(
    `Linking.useUrl has been deprecated in favor of Linking.useURL. This API will be removed in SDK 44.`
  );
  return useURL();
}

export * from './Linking.types';
