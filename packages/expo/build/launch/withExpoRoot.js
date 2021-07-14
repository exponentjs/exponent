import * as ErrorRecovery from 'expo-error-recovery';
import * as React from 'react';
import { useDevKeepAwake } from './useKeepAwake';
export default function withExpoRoot(AppRootComponent) {
    return function ExpoRoot(props) {
        useDevKeepAwake();
        const combinedProps = {
            ...props,
            exp: { ...props.exp, errorRecovery: ErrorRecovery.recoveredProps },
        };
        return React.createElement(AppRootComponent, Object.assign({}, combinedProps));
    };
}
//# sourceMappingURL=withExpoRoot.js.map