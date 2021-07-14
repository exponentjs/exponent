import * as ErrorRecovery from 'expo-error-recovery';
import * as React from 'react';

import { useDevKeepAwake } from './useKeepAwake';
import { InitialProps } from './withExpoRoot.types';

export default function withExpoRoot<P extends InitialProps>(
  AppRootComponent: React.ComponentType<P>
): React.ComponentType<P> {
  return function ExpoRoot(props: P) {
    useDevKeepAwake();

    const combinedProps = {
      ...props,
      exp: { ...props.exp, errorRecovery: ErrorRecovery.recoveredProps },
    };

    return <AppRootComponent {...combinedProps} />;
  };
}
