import { css } from '@emotion/react';
import { theme } from '@expo/styleguide';
import * as React from 'react';

import stripVersionFromPath from '~/common/stripVersionFromPath';
import { paragraph } from '~/components/base/typography';
import ChevronDown from '~/components/icons/ChevronDown';
import { unexpandedSections } from '~/constants/navigation';
import * as Constants from '~/constants/theme';
import { NavigationRoute, Url } from '~/types/common';

const STYLES_TITLE = css`
  ${paragraph}
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  margin-bottom: 16px;
  text-decoration: none;
  font-family: ${Constants.fontFamilies.demi};
  user-select: none;
  background: ${theme.background.tertiary};
  padding: 8px 16px;
  border-radius: 4px;
  color: ${theme.text.default};

  :hover {
    cursor: pointer;
  }
`;

const STYLES_SIDEBAR_INDENT = css`
  padding-left: 16px;
`;

const STYLES_OPEN_CHEVRON_ICON = css`
  transform: rotate(180deg);
`;

if (typeof window !== 'undefined' && !window.hasOwnProperty('sidebarState')) {
  window.sidebarState = {};
}

type Props = {
  asPath: string;
  info: NavigationRoute;
  url: Url;
};

export default class DocumentationSidebarGroup extends React.Component<Props, { isOpen: boolean }> {
  constructor(props: Props) {
    super(props);

    let isOpen = this.isChildRouteActive();
    if (typeof window !== 'undefined') {
      isOpen = isOpen || window.sidebarState[props.info.name];
    }

    // default to always open
    this.state = {
      isOpen: unexpandedSections.includes(props.info.name) ? isOpen : true,
    };
  }

  private persistGlobalSidebarState() {
    window.sidebarState[this.props.info.name] = this.state.isOpen;
  }

  hydrateGlobalSidebarState() {
    this.setState({ isOpen: window.sidebarState[this.props.info.name] });
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      const persistedState = window.sidebarState[this.props.info.name];
      if (typeof persistedState === 'boolean' && this.state.isOpen !== persistedState) {
        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState({ isOpen: persistedState });
      } else {
        this.persistGlobalSidebarState();
      }
    }
  }

  private isChildRouteActive() {
    // Special case for "Get Started"
    if (this.props.info.name === 'Getting to know Expo') {
      if (this.props.asPath.match(/\/versions\/[\w.]+\/$/)) {
        return true;
      }
    }

    let result = false;

    const sections = this.props.info.children;

    const isSectionActive = (section: NavigationRoute) => {
      const linkUrl = stripVersionFromPath(section.as || section.href);
      const pathname = stripVersionFromPath(this.props.url.pathname);
      const asPath = stripVersionFromPath(this.props.asPath);

      if (
        linkUrl === pathname ||
        linkUrl === asPath ||
        linkUrl === '//' // accounts for 'index' page (Getting to know Expo)
      ) {
        result = true;
      }
    };

    let posts: NavigationRoute[] = [];
    sections?.forEach(section => {
      posts = [...posts, ...(section?.posts ?? [])];
    });

    posts.forEach(isSectionActive);
    return result;
  }

  private toggleIsOpen = () => {
    const isOpen = this.state.isOpen;
    this.setState({ isOpen: !isOpen });
    window.sidebarState[this.props.info.name] = !isOpen;
  };

  render() {
    return (
      <div>
        <a css={STYLES_TITLE} onClick={this.toggleIsOpen}>
          {this.props.info.name}
          <ChevronDown size={16} css={this.state.isOpen && STYLES_OPEN_CHEVRON_ICON} />
        </a>
        {this.state.isOpen && <div css={STYLES_SIDEBAR_INDENT}>{this.props.children}</div>}
      </div>
    );
  }
}
