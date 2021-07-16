import * as React from 'react';
import { ScreenProps, ScreenStackHeaderConfigProps } from 'react-native-screens';
import { IStack } from './types';
export interface IScreen {
    meta?: any;
    element?: React.ReactElement<any>;
    screenProps?: ScreenProps;
    headerProps?: ScreenStackHeaderConfigProps;
    href?: string;
}
interface IStackProps {
    stack: IStack<IScreen>;
    children?: React.ReactNode;
}
declare function NativeStack({ stack, children }: IStackProps): JSX.Element;
declare namespace NativeStack {
    var createStack: () => IStack<IScreen>;
}
declare const Stack: typeof NativeStack;
export { Stack };
