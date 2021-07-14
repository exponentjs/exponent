import React, { ComponentType, forwardRef } from 'react';
import { Linking, Platform } from 'react-native';

import Text from '../primitives/Text';
import View from '../primitives/View';
import { LinkProps } from './Text.types';

export const A = forwardRef(({ href, target, isText = true, ...props }: LinkProps & { isText?: boolean }, ref) => {
  const nativeProps = Platform.select<LinkProps>({
    web: {
      href,
      target,
    },
    default: {
      onPress: event => {
        props.onPress && props.onPress(event);
        if (Platform.OS !== 'web' && href !== undefined) {
          Linking.openURL(href);
        }
      },
    },
  });
  const Component = isText ? Text : View;
  return <Component accessibilityRole="link" {...props} {...nativeProps} ref={ref} />;
}) as ComponentType<LinkProps & { isText?: boolean }>;
