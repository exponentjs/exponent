import { MDXProvider } from '@mdx-js/react';
import GithubSlugger from 'github-slugger';
import { withRouter } from 'next/router';
import * as React from 'react';

import { HeadingManager } from '~/common/headingManager';
import DocumentationPage from '~/components/DocumentationPage';
import { HeadingsContext } from '~/components/page-higher-order/withHeadingManager';
import { PageMetadata } from '~/types/common';
import { MarkdownComponents } from '~/ui/components/markdown';

const withDocumentationElements = (meta: PageMetadata) => {
  const DocumentationElementsHOC = withRouter(props => {
    const { router } = props;

    return (
      <HeadingsContext.Provider value={new HeadingManager(new GithubSlugger(), meta)}>
        <DocumentationPage
          title={meta.title}
          description={meta.description}
          url={router}
          asPath={router.asPath}
          sourceCodeUrl={meta.sourceCodeUrl}
          tocVisible={!meta.hideTOC}
          hideFromSearch={meta.hideFromSearch}>
          <MDXProvider components={MarkdownComponents}>{props.children}</MDXProvider>
        </DocumentationPage>
      </HeadingsContext.Provider>
    );
  });

  return DocumentationElementsHOC;
};

export default withDocumentationElements;
