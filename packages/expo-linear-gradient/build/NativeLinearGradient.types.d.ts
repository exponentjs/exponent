import { PropsWithChildren } from 'react';
import { ViewProps } from 'react-native';
export declare type NativeLinearGradientProps = ViewProps & PropsWithChildren<{
    colors: number[];
    locations?: number[] | null;
    startPoint?: NativeLinearGradientPoint | null;
    endPoint?: NativeLinearGradientPoint | null;
}>;
export declare type NativeLinearGradientPoint = [number, number];
