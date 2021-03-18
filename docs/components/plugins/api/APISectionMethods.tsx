import React from 'react';
import ReactMarkdown from 'react-markdown';

import { InlineCode } from '~/components/base/code';
import { LI, UL } from '~/components/base/list';
import { B } from '~/components/base/paragraph';
import { H2, H3Code, H4 } from '~/components/plugins/Headings';
import { DataProps, renderers, resolveTypeName } from '~/components/plugins/api/APISectionUtils';

const renderMethod = ({ signatures }: any): JSX.Element =>
  signatures.map((signature: any) => {
    const { name, parameters, comment, type } = signature;
    return (
      <div key={`method-signature-${name}-${parameters?.length || 0}`}>
        <H3Code>
          <InlineCode>{name}()</InlineCode>
        </H3Code>
        {parameters ? <H4>Arguments</H4> : null}
        {parameters ? (
          <UL>
            {parameters?.map((p: any) => (
              <LI key={`param-${p.name}`}>
                <B>
                  {p.name} (<InlineCode>{resolveTypeName(p.type)}</InlineCode>)
                </B>
              </LI>
            ))}
          </UL>
        ) : null}
        {comment?.shortText ? (
          <ReactMarkdown renderers={renderers}>{comment.shortText}</ReactMarkdown>
        ) : null}
        <br />
        {comment?.returns ? <H4>Returns</H4> : null}
        {comment?.returns ? (
          <UL>
            <LI returnType>
              <InlineCode>{resolveTypeName(type)}</InlineCode>
            </LI>
          </UL>
        ) : null}
        {comment?.returns ? (
          <ReactMarkdown renderers={renderers}>{comment.returns}</ReactMarkdown>
        ) : null}
        <hr />
      </div>
    );
  });

const APISectionMethods: React.FC<DataProps> = ({ data }) =>
  data ? (
    <>
      <H2 key="methods-header">Methods</H2>
      {data.map(renderMethod)}
    </>
  ) : null;

export default APISectionMethods;
