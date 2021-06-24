import { css } from '@emotion/react';
import { theme } from '@expo/styleguide';
import some from 'lodash/some';
import Router from 'next/router';
import NProgress from 'nprogress';
import * as React from 'react';

import * as Utilities from '~/common/utilities';
import * as WindowUtils from '~/common/window';
import DocumentationFooter from '~/components/DocumentationFooter';
import DocumentationHeader from '~/components/DocumentationHeader';
import DocumentationNestedScrollLayout from '~/components/DocumentationNestedScrollLayout';
import DocumentationPageContext from '~/components/DocumentationPageContext';
import DocumentationSidebar from '~/components/DocumentationSidebar';
import DocumentationSidebarRight, {
  SidebarRightComponentType,
} from '~/components/DocumentationSidebarRight';
import Head from '~/components/Head';
import navigation from '~/constants/navigation';
import * as Constants from '~/constants/theme';
import { VERSIONS } from '~/constants/versions';
import { NavigationRoute, Url } from '~/types/common';
import { PageHeader } from '~/ui/components/page-header';

const STYLES_DOCUMENT = css`
  background: ${theme.background.default};
  margin: 0 auto;
  padding: 40px 56px;

  hr {
    border-top: 1px solid ${theme.border.default};
    border-bottom: 0px;
  }

  @media screen and (max-width: ${Constants.breakpoints.mobile}) {
    padding: 20px 16px 48px 16px;
  }
`;

const HIDDEN_ON_MOBILE = css`
  @media screen and (max-width: ${Constants.breakpoints.mobile}) {
    display: none;
  }
`;

const HIDDEN_ON_DESKTOP = css`
  @media screen and (min-width: ${Constants.breakpoints.mobile}) {
    display: none;
  }
`;

type Props = {
  url: Url;
  title: string;
  description?: string;
  asPath: string;
  sourceCodeUrl?: string;
  tocVisible: boolean;
  /* If the page should not show up in the Algolia Docsearch results */
  hideFromSearch?: boolean;
};

type State = {
  isMenuActive: boolean;
  isMobileSearchActive: boolean;
};

export default class DocumentationPage extends React.Component<Props, State> {
  state = {
    isMenuActive: false,
    isMobileSearchActive: false,
  };

  private layoutRef = React.createRef<DocumentationNestedScrollLayout>();
  private sidebarRightRef = React.createRef<SidebarRightComponentType>();

  componentDidMount() {
    Router.events.on('routeChangeStart', () => {
      if (this.layoutRef.current) {
        window.__sidebarScroll = this.layoutRef.current.getSidebarScrollTop();
      }
      NProgress.start();
    });

    Router.events.on('routeChangeComplete', () => {
      NProgress.done();
    });

    Router.events.on('routeChangeError', () => {
      NProgress.done();
    });

    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  private handleResize = () => {
    if (WindowUtils.getViewportSize().width >= Constants.breakpoints.mobileValue) {
      window.scrollTo(0, 0);
    }
  };

  private handleSetVersion = (version: string) => {
    let newPath = Utilities.replaceVersionInUrl(this.props.url.pathname, version);

    if (!newPath.endsWith('/')) {
      newPath += '/';
    }

    // note: we can do this without validating if the page exists or not.
    // the error page will redirect users to the versioned-index page when a page doesn't exists.
    Router.push(newPath);
  };

  private handleShowMenu = () => {
    this.setState({
      isMenuActive: true,
    });
    this.handleHideSearch();
  };

  private handleHideMenu = () => {
    this.setState({
      isMenuActive: false,
    });
  };

  private handleToggleSearch = () => {
    this.setState(prevState => ({
      isMobileSearchActive: !prevState.isMobileSearchActive,
    }));
  };

  private handleHideSearch = () => {
    this.setState({
      isMobileSearchActive: false,
    });
  };

  private isReferencePath = () => {
    return this.props.url.pathname.startsWith('/versions');
  };

  private isGeneralPath = () => {
    return some(navigation.generalDirectories, name =>
      this.props.url.pathname.startsWith(`/${name}`)
    );
  };

  private isGettingStartedPath = () => {
    return (
      this.props.url.pathname === '/' ||
      some(navigation.startingDirectories, name => this.props.url.pathname.startsWith(`/${name}`))
    );
  };

  private isEasPath = () => {
    return some(navigation.easDirectories, name => this.props.url.pathname.startsWith(`/${name}`));
  };

  private isPreviewPath = () => {
    return some(navigation.previewDirectories, name =>
      this.props.url.pathname.startsWith(`/${name}`)
    );
  };

  private getCanonicalUrl = () => {
    if (this.isReferencePath()) {
      return `https://docs.expo.io${Utilities.replaceVersionInUrl(
        this.props.url.pathname,
        'latest'
      )}`;
    } else {
      return `https://docs.expo.io/${this.props.url.pathname}`;
    }
  };

  private getAlgoliaTag = () => {
    if (this.props.hideFromSearch === true) {
      return null;
    }

    return this.isReferencePath() ? this.getVersion() : 'none';
  };

  private getVersion = () => {
    let version = (this.props.asPath || this.props.url.pathname).split(`/`)[2];
    if (!version || !VERSIONS.includes(version)) {
      version = 'latest';
    }
    return version;
  };

  private getRoutes = (): NavigationRoute[] => {
    if (this.isReferencePath()) {
      const version = this.getVersion();
      return navigation.reference[version];
    } else {
      return navigation[this.getActiveTopLevelSection()];
    }
  };

  private getActiveTopLevelSection = () => {
    if (this.isReferencePath()) {
      return 'reference';
    } else if (this.isGeneralPath()) {
      return 'general';
    } else if (this.isGettingStartedPath()) {
      return 'starting';
    } else if (this.isEasPath()) {
      return 'eas';
    } else if (this.isPreviewPath()) {
      return 'preview';
    }

    return 'general';
  };

  render() {
    const sidebarScrollPosition = process.browser ? window.__sidebarScroll : 0;

    const version = this.getVersion();
    const routes = this.getRoutes();

    const isReferencePath = this.isReferencePath();

    const headerElement = (
      <DocumentationHeader
        activeSection={this.getActiveTopLevelSection()}
        version={version}
        isMenuActive={this.state.isMenuActive}
        isMobileSearchActive={this.state.isMobileSearchActive}
        isAlgoliaSearchHidden={this.state.isMenuActive}
        onShowMenu={this.handleShowMenu}
        onHideMenu={this.handleHideMenu}
        onToggleSearch={this.handleToggleSearch}
      />
    );

    const sidebarElement = (
      <DocumentationSidebar
        url={this.props.url}
        asPath={this.props.asPath}
        routes={routes}
        version={version}
        onSetVersion={this.handleSetVersion}
        isVersionSelectorHidden={!isReferencePath}
      />
    );

    const handleContentScroll = (contentScrollPosition: number) => {
      window.requestAnimationFrame(() => {
        if (this.sidebarRightRef && this.sidebarRightRef.current) {
          this.sidebarRightRef.current.handleContentScroll(contentScrollPosition);
        }
      });
    };

    const sidebarRight = <DocumentationSidebarRight ref={this.sidebarRightRef} />;

    const algoliaTag = this.getAlgoliaTag();

    return (
      <DocumentationNestedScrollLayout
        ref={this.layoutRef}
        header={headerElement}
        sidebar={sidebarElement}
        sidebarRight={sidebarRight}
        tocVisible={this.props.tocVisible}
        isMenuActive={this.state.isMenuActive}
        isMobileSearchActive={this.state.isMobileSearchActive}
        onContentScroll={handleContentScroll}
        sidebarScrollPosition={sidebarScrollPosition}>
        <Head title={`${this.props.title} - Expo Documentation`}>
          {algoliaTag !== null && <meta name="docsearch:version" content={algoliaTag} />}
          <meta property="og:title" content={`${this.props.title} - Expo Documentation`} />
          <meta property="og:type" content="website" />
          <meta property="og:image" content="https://docs.expo.io/static/images/og.png" />
          <meta property="og:image:url" content="https://docs.expo.io/static/images/og.png" />
          <meta
            property="og:image:secure_url"
            content="https://docs.expo.io/static/images/og.png"
          />
          <meta property="og:locale" content="en_US" />
          <meta property="og:site_name" content="Expo Documentation" />
          <meta
            property="og:description"
            content="Expo is an open-source platform for making universal native apps for Android, iOS, and the web with JavaScript and React."
          />

          <meta name="twitter:site" content="@expo" />
          <meta name="twitter:card" content="summary" />
          <meta property="twitter:title" content={`${this.props.title} - Expo Documentation`} />
          <meta
            name="twitter:description"
            content="Expo is an open-source platform for making universal native apps for Android, iOS, and the web with JavaScript and React."
          />
          <meta property="twitter:image" content="https://docs.expo.io/static/images/twitter.png" />

          {(version === 'unversioned' || this.isPreviewPath()) && (
            <meta name="robots" content="noindex" />
          )}
          {version !== 'unversioned' && <link rel="canonical" href={this.getCanonicalUrl()} />}
        </Head>

        {!this.state.isMenuActive ? (
          <div css={STYLES_DOCUMENT}>
            <PageHeader title={this.props.title} description={this.props.description} />
            <DocumentationPageContext.Provider value={{ version }}>
              {this.props.children}
            </DocumentationPageContext.Provider>
            <DocumentationFooter
              title={this.props.title}
              url={this.props.url}
              asPath={this.props.asPath}
              sourceCodeUrl={this.props.sourceCodeUrl}
            />
          </div>
        ) : (
          <div>
            <div css={[STYLES_DOCUMENT, HIDDEN_ON_MOBILE]}>
              <PageHeader title={this.props.title} description={this.props.description} />
              <DocumentationPageContext.Provider value={{ version }}>
                {this.props.children}
              </DocumentationPageContext.Provider>
              <DocumentationFooter
                title={this.props.title}
                asPath={this.props.asPath}
                sourceCodeUrl={this.props.sourceCodeUrl}
              />
            </div>
            <div css={HIDDEN_ON_DESKTOP}>
              <DocumentationSidebar
                url={this.props.url}
                asPath={this.props.asPath}
                routes={routes}
                version={version}
                onSetVersion={this.handleSetVersion}
                isVersionSelectorHidden={!isReferencePath}
              />
            </div>
          </div>
        )}
      </DocumentationNestedScrollLayout>
    );
  }
}
