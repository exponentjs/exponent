import { css } from '@emotion/react';
import {
  theme,
  palette,
  useTheme,
  ThemeDarkIcon,
  ThemeLightIcon,
  ThemeAutoIcon,
  ChevronDownIcon,
  shadows,
} from '@expo/styleguide';
import Link from 'next/link';
import * as React from 'react';

import { VisuallyHidden } from './VisuallyHidden';
import { MoreHorizontal } from './icons/MoreHorizontal';
import { SDK } from './icons/SDK';
import { Search } from './icons/Search';
import { X } from './icons/X';

import { paragraph } from '~/components/base/typography';
import AlgoliaSearch from '~/components/plugins/AlgoliaSearch';
import { shouldShowFeaturePreviewLink } from '~/constants/FeatureFlags';
import * as Constants from '~/constants/theme';

const STYLES_LOGO = css`
  display: flex;
`;

const STYLES_UNSTYLED_ANCHOR = css`
  color: inherit;
  text-decoration: none;
  display: flex;
  align-items: center;
`;

const STYLES_TITLE_TEXT = css`
  color: inherit;
  text-decoration: none;
  white-space: nowrap;
  padding-left: 8px;
  font-size: 1.2rem;
  font-family: ${Constants.fonts.bold};
  color: ${theme.text.default};
`;

const STYLES_LEFT = css`
  flex-shrink: 0;
  padding-right: 24px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const STYLES_RIGHT = css`
  min-width: 5%;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const STYLES_LOGO_CONTAINER = css`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const STYLES_NAV = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  background-color: ${theme.background.default};
  z-index: 2;
  margin: 0 auto;
  padding: 0 16px;
  height: 60px;
  box-sizing: unset;
  @media screen and (max-width: ${Constants.breakpoints.mobile}) {
    border-bottom: 1px solid ${theme.border.default};
  }
`;

const STYLES_MOBILE_NAV = css`
  padding: 0px;
  height: 56px;
  background: ${theme.background.default};
  display: none;

  @media screen and (max-width: ${Constants.breakpoints.mobile}) {
    display: flex;
    border-bottom: 1px solid ${theme.border.default};
  }
`;

const STYLES_STICKY = css`
  @media screen and (max-width: ${Constants.breakpoints.mobile}) {
    position: sticky;
    top: 0px;
    z-index: 3;
  }
`;

const STYLES_SEARCH_OVERLAY = css`
  @media screen and (max-width: ${Constants.breakpoints.mobile}) {
    z-index: 1;
    position: fixed;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    opacity: 0.5;
    background-color: ${palette.dark.black};
  }
`;

const STYLES_HIDDEN_ON_MOBILE = css`
  @media screen and (max-width: ${Constants.breakpoints.mobile}) {
    display: none;
  }
`;

const SECTION_LINKS_WRAPPER = css`
  margin-left: 16px;

  @media screen and (max-width: ${Constants.breakpoints.mobile}) {
    margin-left: 0px;
  }
`;

const STYLES_MENU_BUTTON_CONTAINER = css`
  display: grid;
  grid-gap: 12px;
  grid-auto-flow: column;
`;

const STYLES_MENU_BUTTON = css`
  display: none;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  height: 40px;
  width: 40px;
  border-radius: 4px;

  :hover {
    background-color: ${theme.background.tertiary};
  }

  @media screen and (max-width: ${Constants.breakpoints.mobile}) {
    display: grid;
  }
`;

const SECTION_LINK = css`
  text-decoration: none;
  font-family: ${Constants.fontFamilies.demi};
  cursor: pointer;

  padding: 0 16px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 4px;

  :hover {
    background-color: ${theme.background.tertiary};
  }

  @media screen and (max-width: ${Constants.breakpoints.mobile}) {
    height: 56px;
    border-radius: 0px;
  }
`;

const SECTION_LINK_ACTIVE = css`
  background-color: ${theme.background.tertiary};
`;

const SECTION_LINK_TEXT = css`
  color: ${theme.text.default} !important;
  bottom: 0;
  left: 0;
  right: 0;
`;

const SELECT_THEME_CONTAINER = css`
  position: relative;
  min-width: 120px;
`;

const SELECT_THEME = css`
  ${paragraph}
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  color: ${theme.text.default};
  line-height: 1.3;
  padding: 0px 36px 0px 36px;
  width: 100%;
  margin: 0;
  border: 1px solid ${theme.border.default};
  box-shadow: ${shadows.input};
  border-radius: 4px;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  background-color: ${theme.background.default};
  cursor: pointer;
`;

const SELECT_THEME_ICON = css`
  position: absolute;
  left: 12px;
  top: 12px;
  pointer-events: none;
`;

const SELECT_THEME_CHEVRON = css`
  position: absolute;
  right: 12px;
  top: 12px;
  pointer-events: none;
`;

const HEADER_RIGHT = css`
  display: grid;
  grid-template-columns: auto auto;
  gap: 12px;
`;

type SectionContainerProps = {
  children: JSX.Element[];
  spaceBetween?: number;
  spaceAround?: number;
  style?: React.CSSProperties;
  className?: string;
};

const SectionContainer: React.FC<SectionContainerProps> = ({
  spaceBetween = 0,
  spaceAround = 0,
  children,
  style,
  className,
}) => {
  return (
    <div
      className={className}
      style={{ display: 'flex', paddingLeft: spaceAround, paddingRight: spaceAround, ...style }}>
      {children.map((child, i) => (
        <div key={i.toString()} style={{ paddingLeft: i === 0 ? 0 : spaceBetween }}>
          {child}
        </div>
      ))}
    </div>
  );
};

type Props = {
  isAlgoliaSearchHidden: boolean;
  isMenuActive: boolean;
  isMobileSearchActive: boolean;
  version: string;
  activeSection?: string;
  onToggleSearch: () => void;
  onShowMenu: () => void;
  onHideMenu: () => void;
};

function SelectTheme() {
  const { themeName, setDarkMode, setAutoMode, setLightMode } = useTheme();
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(function didMount() {
    setLoaded(true);
  }, []);

  if (!loaded) return <div css={SELECT_THEME_CONTAINER} />;

  return (
    <div css={SELECT_THEME_CONTAINER}>
      <VisuallyHidden>
        <label htmlFor="select-theme">Select your theme</label>
      </VisuallyHidden>

      <select
        id="select-theme"
        css={SELECT_THEME}
        value={themeName}
        onChange={e => {
          const option = e.target.value;

          if (option === 'auto') setAutoMode();
          if (option === 'dark') setDarkMode();
          if (option === 'light') setLightMode();
        }}>
        <option value="auto">Auto</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      <div css={SELECT_THEME_ICON}>
        {themeName === 'auto' && <ThemeAutoIcon size={16} />}
        {themeName === 'dark' && <ThemeDarkIcon size={16} />}
        {themeName === 'light' && <ThemeLightIcon size={16} />}
      </div>
      <div css={SELECT_THEME_CHEVRON}>
        <ChevronDownIcon size={16} />
      </div>
    </div>
  );
}

export default class DocumentationHeader extends React.PureComponent<Props> {
  render() {
    return (
      <div>
        <header css={[STYLES_NAV, STYLES_STICKY]}>
          <div css={STYLES_LEFT}>
            <div css={STYLES_LOGO_CONTAINER}>
              <Link href="/" passHref>
                <a css={STYLES_UNSTYLED_ANCHOR}>
                  <span css={STYLES_LOGO} aria-hidden>
                    <SDK />
                  </span>
                  <h1 css={STYLES_TITLE_TEXT}>Expo</h1>
                </a>
              </Link>
              {this.renderSectionLinks(true)}
            </div>
          </div>
          <div css={STYLES_RIGHT}>
            {!this.props.isAlgoliaSearchHidden && (
              <div css={HEADER_RIGHT}>
                <AlgoliaSearch version={this.props.version} hiddenOnMobile />
                <SelectTheme />
              </div>
            )}

            {!this.props.isMenuActive && (
              <div css={STYLES_MENU_BUTTON_CONTAINER}>
                <span css={STYLES_MENU_BUTTON} onClick={this.props.onToggleSearch}>
                  <Search />
                </span>
                <span css={STYLES_MENU_BUTTON} onClick={this.props.onShowMenu}>
                  <MoreHorizontal />
                </span>
              </div>
            )}

            {this.props.isMenuActive && (
              <span css={STYLES_MENU_BUTTON} onClick={this.props.onHideMenu}>
                <X />
              </span>
            )}
          </div>
        </header>
        <header css={[STYLES_NAV, STYLES_MOBILE_NAV]}>
          {this.props.isMobileSearchActive ? (
            <AlgoliaSearch
              version={this.props.version}
              hiddenOnMobile={false}
              onToggleSearch={this.props.onToggleSearch}
            />
          ) : (
            this.renderSectionLinks(false)
          )}
        </header>
        <div css={this.props.isMobileSearchActive && STYLES_SEARCH_OVERLAY} />
      </div>
    );
  }

  private renderSectionLinks = (hiddenOnMobile: boolean) => {
    return (
      <div css={[SECTION_LINKS_WRAPPER, hiddenOnMobile && STYLES_HIDDEN_ON_MOBILE]}>
        <SectionContainer spaceBetween={hiddenOnMobile ? 8 : 0}>
          <Link href="/" passHref>
            <a css={[SECTION_LINK, this.props.activeSection === 'starting' && SECTION_LINK_ACTIVE]}>
              <span css={SECTION_LINK_TEXT}>Get Started</span>
            </a>
          </Link>
          <Link href="/guides" passHref>
            <a css={[SECTION_LINK, this.props.activeSection === 'general' && SECTION_LINK_ACTIVE]}>
              <span css={SECTION_LINK_TEXT}>Guides</span>
            </a>
          </Link>
          {shouldShowFeaturePreviewLink() ? (
            <Link href="/feature-preview" passHref>
              <a
                css={[
                  SECTION_LINK,
                  this.props.activeSection === 'featurePreview' && SECTION_LINK_ACTIVE,
                ]}>
                <span css={SECTION_LINK_TEXT}>Feature Preview</span>
              </a>
            </Link>
          ) : (
            <span />
          )}
          <Link href="/versions/latest/" passHref>
            <a
              css={[SECTION_LINK, this.props.activeSection === 'reference' && SECTION_LINK_ACTIVE]}>
              <span css={SECTION_LINK_TEXT}>API Reference</span>
            </a>
          </Link>
        </SectionContainer>
      </div>
    );
  };
}
