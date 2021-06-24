import { css } from '@emotion/react';
import { colors } from '@expo/styleguide';
import NextLink from 'next/link';
import React from 'react';

export type LinkProps = React.PropsWithChildren<{
  target?: string;
  tabIndex?: number;
  href?: string;
  title?: string;
  rel?: string;
  as?: string;
  isStyled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  onMouseMove?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  onTouchStart?: (event: React.TouchEvent<HTMLAnchorElement>) => void;
  testID?: string;
  style?: React.CSSProperties;
  className?: string;
  openInNewTab?: boolean;
  ariaLabel?: string;
}>;

export function Link(props: LinkProps) {
  const { href, openInNewTab = false } = props;

  return (
    <NextLink href={href ?? ''} passHref={Boolean(href)}>
      <a
        aria-label={props.ariaLabel}
        css={props.isStyled ? linkStyle : undefined}
        className={props.className}
        target={props.target}
        title={props.title}
        rel={props.target === '_blank' && !props.rel ? 'noopener' : props.rel}
        style={props.style}
        onClick={props.onClick}
        tabIndex={props.tabIndex}
        data-testid={props.testID}
        {...(openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        onMouseMove={props.onMouseMove}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
        onTouchStart={props.onTouchStart}>
        {props.children}
      </a>
    </NextLink>
  );
}

const linkStyle = css({
  textDecoration: 'none',
  transition: '200ms ease opacity',
  cursor: 'pointer',
  opacity: 1,
  ':hover': {
    opacity: 0.8,
  },
  ':visited': {
    color: colors.primary[500],
  },
});
