import { css } from '@emotion/react';
import { theme } from '@expo/styleguide';
import React from 'react';

const SKIP_TO_CONTENT_STYLES = css`
  text-decoration: none;
  position: absolute;
  left: -100%;
  top: -100%;
  z-index: 9999;
  border-radius: 4px;

  background: ${theme.button.tertiary};
  padding: 8px;

  &:focus {
    left: 16px;
    top: 16px;
  }
`;

export type SkipToContentProps = {
  children: React.ReactNode;
};

export const SkipToContent = ({ children }: SkipToContentProps) => {
  return (
    <a href="#main-content" css={SKIP_TO_CONTENT_STYLES}>
      {children}
    </a>
  );
};

export type MainProps = {
  children: React.ReactNode;
};

export const Main = ({ children, ...props }: MainProps) => {
  return (
    <main id="main-content" {...props}>
      {children}
    </main>
  );
};
