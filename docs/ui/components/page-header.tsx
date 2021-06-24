import { css } from '@emotion/react';
import { theme } from '@expo/styleguide';
import React, { ReactNode } from 'react';

import { H1, P } from '~/ui/components/text';

type Props = {
  title: string;
  description?: ReactNode;
};

export const PageHeader = ({ title, description }: Props) => {
  const descriptionIsText = typeof description === 'string';
  const descriptionIsComponent = description && !descriptionIsText;

  return (
    <header css={containerStyle}>
      <H1>{title}</H1>
      {descriptionIsText && <P css={descriptionStyle}>{description}</P>}
      {descriptionIsComponent && description}
    </header>
  );
};

const containerStyle = css`
  border-bottom: 1px solid ${theme.border.default};
  margin-bottom: 1rem;
  padding-bottom: 1rem;

  /* Add spacing between title and description, only when description is set */
  h1 + * {
    padding-top: 0.25rem;
  }
`;

const descriptionStyle = css`
  color: ${theme.text.secondary};
`;
