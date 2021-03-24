import React from 'react';
import ReactMarkdown from 'react-markdown';

import { InlineCode } from '~/components/base/code';
import { InternalLink } from '~/components/base/link';
import { LI, UL } from '~/components/base/list';
import { B, P } from '~/components/base/paragraph';

export type APISubSectionProps = {
  data: Record<string, any>[];
  apiName?: string;
};

export enum TypeDocKind {
  Enum = 4,
  Function = 64,
  Class = 128,
  Property = 1024,
  TypeAlias = 4194304,
}

export const renderers: React.ComponentProps<typeof ReactMarkdown>['renderers'] = {
  inlineCode: ({ value }) => <InlineCode>{value}</InlineCode>,
  list: ({ children }) => <UL>{children}</UL>,
  listItem: ({ children }) => <LI>{children}</LI>,
  link: ({ href, children }) => <InternalLink href={href}>{children}</InternalLink>,
  paragraph: ({ children }) => (children ? <P>{children}</P> : null),
  text: ({ value }) => (value ? <span>{value}</span> : null),
};

export const inlineRenderers: React.ComponentProps<typeof ReactMarkdown>['renderers'] = {
  ...renderers,
  paragraph: ({ children }) => (children ? <span>{children}</span> : null),
};

export type CommentData = {
  text?: string;
  shortText?: string;
};

type TypeDefinitionData = {
  name: string;
  type: string;
  elementType?: {
    name: string;
  };
  typeArguments?: TypeDefinitionData[];
};

export const resolveTypeName = ({
  elementType,
  name,
  type,
  typeArguments,
}: TypeDefinitionData): string | JSX.Element => {
  if (name) {
    if (type === 'reference') {
      if (typeArguments) {
        if (name === 'Promise') {
          return (
            <span>
              {'Promise<'}
              {typeArguments.map(resolveTypeName)}
              {'>'}
            </span>
          );
        } else {
          return `${typeArguments.map(resolveTypeName)}`;
        }
      } else {
        return (
          <InternalLink href={`#${name.toLowerCase()}`} key={`type-link-${name}`}>
            {name}
          </InternalLink>
        );
      }
    } else {
      return name;
    }
  } else if (elementType?.name) {
    if (type === 'array') {
      return elementType.name + '[]';
    }
    return elementType.name + type;
  }
  return 'undefined';
};

type MethodParamData = {
  name: string;
  type: TypeDefinitionData;
  comment?: CommentData;
};

export const renderParam = ({ comment, name, type }: MethodParamData): JSX.Element => (
  <LI key={`param-${name}`}>
    <B>
      {name} (<InlineCode>{resolveTypeName(type)}</InlineCode>)
    </B>
    {comment?.text ? (
      <>
        {' - '}
        <ReactMarkdown renderers={inlineRenderers}>{comment.text}</ReactMarkdown>
      </>
    ) : null}
  </LI>
);
