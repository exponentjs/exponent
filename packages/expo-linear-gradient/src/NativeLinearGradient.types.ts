import { PropsWithChildren } from 'react';
import { ViewProps } from 'react-native';

export type NativeLinearGradientProps = ViewProps &
  PropsWithChildren<{
    colors: number[];
    locations?: number[] | null;
    startPoint?: NativeLinearGradientPoint | null;
    endPoint?: NativeLinearGradientPoint | null;
  }>;

export type NativeLinearGradientPoint = [number, number];
