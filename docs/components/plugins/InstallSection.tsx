import { css } from '@emotion/react';
import { theme } from '@expo/styleguide';
import * as React from 'react';

import TerminalBlock from './TerminalBlock';

import * as Constants from '~/constants/theme';

const STYLES_P = css`
  line-height: 1.8rem;
  margin-top: 1.4rem;
  margin-bottom: 1.4rem;
  color: ${theme.text.default};
`;

const STYLES_BOLD = css`
  font-family: ${Constants.fonts.demi};
  font-weight: 400;
  text-decoration: none;
  color: ${theme.link.default};
  :hover {
    text-decoration: underline;
  }
`;
const STYLES_LINK = css`
  text-decoration: none;
  color: ${theme.link.default};
  :hover {
    text-decoration: underline;
  }
`;

type Props = {
  packageName: string;
  hideBareInstructions?: boolean;
  cmd?: string[];
  href?: string;
};

const getPackageLink = (packageNames: string) =>
  `https://github.com/expo/expo/tree/master/packages/${packageNames.split(' ')[0]}`;

const InstallSection: React.FC<Props> = ({
  packageName,
  hideBareInstructions = false,
  cmd = [`expo install ${packageName}`],
  href = getPackageLink(packageName),
}) => (
  <div>
    <TerminalBlock cmd={cmd} />
    {hideBareInstructions ? null : (
      <p css={STYLES_P}>
        If you're installing this in a{' '}
        <a css={STYLES_LINK} href="/introduction/managed-vs-bare/#bare-workflow">
          bare React Native app
        </a>
        , you should also follow{' '}
        <a css={STYLES_BOLD} href={href}>
          these additional installation instructions
        </a>
        .
      </p>
    )}
  </div>
);

export default InstallSection;
