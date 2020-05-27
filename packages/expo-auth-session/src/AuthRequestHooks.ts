import { useCallback, useEffect, useRef, useState } from 'react';

import { AuthRequest } from './AuthRequest';
import { AuthRequestConfig, AuthRequestPromptOptions } from './AuthRequest.types';
import { AuthSessionResult } from './AuthSession.types';
import { DiscoveryDocument, IssuerOrDiscovery, resolveDiscoveryAsync } from './Discovery';

/**
 * Fetch the discovery document from an OpenID Connect issuer.
 *
 * @param issuerOrDiscovery
 */
export function useAutoDiscovery(issuerOrDiscovery: IssuerOrDiscovery): DiscoveryDocument | null {
  const [discovery, setDiscovery] = useState<DiscoveryDocument | null>(null);

  useEffect(() => {
    let isHookStillRelevant = true;

    resolveDiscoveryAsync(issuerOrDiscovery).then((discovery) => {
      if (isHookStillRelevant) {
        setDiscovery(discovery);
      }
    });

    return () => {
      isHookStillRelevant = false;
    };
  }, [issuerOrDiscovery]);

  return discovery;
}

/**
 * Load an authorization request.
 * Returns a loaded request, a response, and a prompt method.
 * When the prompt method completes then the response will be fulfilled.
 *
 * @param config
 * @param discovery
 */
export function useAuthRequest(
  config: AuthRequestConfig,
  discovery: DiscoveryDocument | null
): [
  AuthRequest | null,
  AuthSessionResult | null,
  (options?: AuthRequestPromptOptions) => Promise<AuthSessionResult>
] {
  const [request, setRequest] = useState<AuthRequest | null>(null);
  const [result, setResult] = useState<AuthSessionResult | null>(null);
  const isMountedRef = useRef<boolean | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const promptAsync = useCallback(
    async (options: AuthRequestPromptOptions = {}) => {
      if (!discovery || !request) {
        throw new Error('Cannot prompt to authenticate until the request has finished loading.');
      }
      const result = await request?.promptAsync(discovery, options);
      if (isMountedRef.current) {
        setResult(result);
      }
      return result;
    },
    [request?.url, discovery?.authorizationEndpoint]
  );

  useEffect(() => {
    let isHookStillRelevant = true;

    if (config && discovery) {
      const request = new AuthRequest(config);
      request.makeAuthUrlAsync(discovery).then(() => {
        if (isHookStillRelevant) {
          setRequest(request);
        }
      });
    }

    return () => {
      isHookStillRelevant = false;
    };
  }, [
    discovery?.authorizationEndpoint,
    config.clientId,
    config.redirectUri,
    config.prompt,
    config.scopes.join(','),
    config.clientSecret,
    config.codeChallenge,
    config.state,
    JSON.stringify(config.extraParams || {}),
    config.usePKCE,
  ]);

  return [request, result, promptAsync];
}
