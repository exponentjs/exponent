import { css } from '@emotion/react';
import React from 'react';

const VISUALLY_HIDDEN_STYLES = css`
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
`;

export const VisuallyHidden = (props: React.HTMLAttributes<HTMLElement>) => (
  <div css={VISUALLY_HIDDEN_STYLES} {...props} />
);
