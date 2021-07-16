import * as React from 'react';

import { Stack } from './stack';

const appStack = Stack.createStack();

function StackContainer({ children }: any) {
  return <Stack stack={appStack}>{children}</Stack>;
}

export { StackContainer, appStack as Stack };
