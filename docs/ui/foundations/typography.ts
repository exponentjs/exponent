import { CSSObject } from '@emotion/react';
import { theme, borderRadius } from '@expo/styleguide';

import { breakpoints } from '~/ui/foundations/breakpoints';

export const fontFaces = {
  black: 'expo-brand-black',
  bold: 'expo-brand-bold',
  book: 'expo-brand-book',
  demi: 'expo-brand-demi',
  light: 'expo-brand-light',
  mono: 'expo-brand-mono',
};

const fontStack = `system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'`;

const monoStack = `Monaco,Consolas,'Liberation Mono','Courier New',monospace, 'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'`;

export const fontStacks = {
  black: `${fontFaces.black}, ${fontStack}`,
  bold: `${fontFaces.bold}, ${fontStack}`,
  book: `${fontFaces.book}, ${fontStack}`,
  demi: `${fontFaces.demi}, ${fontStack}`,
  light: `${fontFaces.light}, ${fontStack}`,
  mono: `${fontFaces.mono}, ${monoStack}`,
};

export const body = 16;

const textSizes = {
  52: {
    fontSize: '52px',
    letterSpacing: '-0.022em',
    lineHeight: '120%',
  },
  32: {
    fontSize: '32px',
    lineHeight: '130%',
    letterSpacing: '-0.021em',
  },
  28: {
    fontSize: '28px',
    letterSpacing: '-0.021em',
    lineHeight: '130%',
  },
  24: {
    fontSize: '24px',
    letterSpacing: '-0.019em',
    lineHeight: '130%',
  },
  22: {
    fontSize: '22px',
    letterSpacing: '-0.018em',
    lineHeight: '140%',
  },
  20: {
    fontSize: '20px',
    lineHeight: '150%',
    letterSpacing: '-0.017em',
  },
  18: {
    fontSize: '18px',
    lineHeight: '150%',
    letterSpacing: '-0.014em',
  },
  17: {
    fontSize: '17px',
    lineHeight: '150%',
    letterSpacing: '-0.013em',
  },
  16: {
    fontSize: '16px',
    lineHeight: '150%',
    letterSpacing: '-0.011em',
  },
  15: {
    fontSize: '15px',
    lineHeight: '150%',
    letterSpacing: '-0.009em',
  },
  14: {
    fontSize: '14px',
    lineHeight: '150%',
    letterSpacing: '-0.006em',
  },
  13: {
    fontSize: '13px',
    lineHeight: '150%',
    letterSpacing: '-0.003em',
  },
  12: {
    fontSize: '12px',
    lineHeight: '150%',
    letterSpacing: '0em',
  },
};

export const textStyles: { [k: string]: CSSObject } = {
  h1: {
    fontFamily: fontStacks.bold,
    color: theme.text.default,
    fontWeight: 500,
    ...textSizes[52],
    [`@media (max-width: ${breakpoints.narrowWithGutters}px)`]: textSizes[28],
    [`@media (max-width: ${breakpoints.narrowMobile}px)`]: textSizes[22],
  },
  h2: {
    fontFamily: fontStacks.demi,
    color: theme.text.default,
    fontWeight: 500,
    ...textSizes[32],
    [`@media (max-width: ${breakpoints.narrowWithGutters}px)`]: textSizes[24],
    [`@media (max-width: ${breakpoints.narrowMobile}px)`]: textSizes[22],
  },
  h3: {
    fontFamily: fontStacks.demi,
    color: theme.text.default,
    fontWeight: 500,
    ...textSizes[24],
    [`@media (max-width: ${breakpoints.narrowWithGutters}px)`]: textSizes[20],
    [`@media (max-width: ${breakpoints.narrowMobile}px)`]: textSizes[18],
  },
  h4: {
    fontFamily: fontStacks.demi,
    color: theme.text.default,
    fontWeight: 500,
    ...textSizes[22],
    [`@media (max-width: ${breakpoints.narrowWithGutters}px)`]: textSizes[18],
    [`@media (max-width: ${breakpoints.narrowMobile}px)`]: textSizes[16],
  },
  h5: {
    fontFamily: fontStacks.demi,
    color: theme.text.default,
    fontWeight: 500,
    ...textSizes[20],
    [`@media (max-width: ${breakpoints.narrowWithGutters}px)`]: textSizes[17],
    [`@media (max-width: ${breakpoints.narrowMobile}px)`]: textSizes[15],
  },
  label: {
    fontFamily: fontStacks.demi,
    color: theme.text.default,
    fontWeight: 500,
    ...textSizes[15],
    [`@media (max-width: ${breakpoints.narrowWithGutters}px)`]: textSizes[14],
    [`@media (max-width: ${breakpoints.narrowMobile}px)`]: textSizes[13],
  },
  headline: {
    fontFamily: fontStacks.demi,
    color: theme.text.default,
    fontWeight: 500,
    ...textSizes[16],
    [`@media (max-width: ${breakpoints.narrowWithGutters}px)`]: textSizes[15],
    [`@media (max-width: ${breakpoints.narrowMobile}px)`]: textSizes[14],
  },
  smallcaps: {
    fontFamily: fontStacks.demi,
    color: theme.text.default,
    textTransform: 'uppercase',
    fontWeight: 400,
    ...textSizes[13],
    [`@media (max-width: ${breakpoints.narrowMobile}px)`]: textSizes[12],
  },
  psmall: {
    fontFamily: fontStacks.book,
    color: theme.text.default,
    fontWeight: 400,
    ...textSizes[14],
    [`@media (max-width: ${breakpoints.narrowWithGutters}px)`]: textSizes[13],
    [`@media (max-width: ${breakpoints.narrowMobile}px)`]: textSizes[12],
  },
  pnav: {
    fontFamily: fontStacks.book,
    color: theme.text.default,
    fontWeight: 400,
    ...textSizes[16],
    [`@media (max-width: ${breakpoints.narrowMobile}px)`]: textSizes[14],
  },
  p: {
    fontFamily: fontStacks.book,
    color: theme.text.default,
    fontWeight: 400,
    ...textSizes[16],
    [`@media (max-width: ${breakpoints.narrowWithGutters}px)`]: textSizes[15],
    [`@media (max-width: ${breakpoints.narrowMobile}px)`]: textSizes[14],
  },
  pbold: {
    fontFamily: fontStacks.bold,
    fontWeight: 500,
  },
  pdemi: {
    fontFamily: fontStacks.demi,
    fontWeight: 500,
  },
  pmedium: {
    fontFamily: fontStacks.book,
    color: theme.text.default,
    fontWeight: 400,
    ...textSizes[20],
    [`@media (max-width: ${breakpoints.narrowWithGutters}px)`]: textSizes[17],
    [`@media (max-width: ${breakpoints.narrowMobile}px)`]: textSizes[15],
  },
  plarge: {
    fontFamily: fontStacks.book,
    color: theme.text.default,
    fontStyle: 'normal',
    fontWeight: 400,
    ...textSizes[22],
    [`@media (max-width: ${breakpoints.narrowWithGutters}px)`]: textSizes[18],
    [`@media (max-width: ${breakpoints.narrowMobile}px)`]: textSizes[17],
  },
  a: {
    color: theme.link.default,
    textDecoration: 'none',
    transition: '200ms ease opacity',
    cursor: 'pointer',
    opacity: 1,
    // transform prevents a 1px shift on hover on Safari
    transform: 'translate3d(0,0,0)',
    ':visited': {
      color: theme.link.default,
    },
    ':hover': {
      opacity: 0.8,
    },
  },
  link: {
    textDecoration: 'none',
    cursor: 'pointer',
    // transform prevents a 1px shift on hover on Safari
    transform: 'translate3d(0,0,0)',
    ':hover': {
      transition: 'opacity 200ms',
      opacity: 0.8,
    },
  },
  code: {
    fontFamily: fontStacks.mono,
    color: theme.text.default,
    display: 'inline-block',
    fontSize: '13px',
    backgroundColor: theme.background.secondary,
    border: `1px solid ${theme.border.default}`,
    borderRadius: borderRadius.medium,
    padding: '2px 4px',
    lineHeight: '130%',
    fontWeight: 400,
    [`@media (max-width: ${breakpoints.narrowMobile}px)`]: {
      fontSize: '12px',
    },
  },
  pre: {
    fontFamily: fontStacks.mono,
    color: theme.text.default,
    fontSize: '14px',
    lineHeight: '150%',
    backgroundColor: theme.background.secondary,
    borderRadius: borderRadius.small,
    border: `1px solid ${theme.border.default}`,
    padding: '16px',
    margin: '16px 0',
    [`@media (max-width: ${breakpoints.narrowMobile}px)`]: {
      fontSize: '12px',
    },
  },
  hr: {
    backgroundColor: '#FF0000',
    border: 0,
    height: 1,
    display: 'block',
    width: '100%',
  },
  ul: {
    fontFamily: fontStacks.book,
    color: theme.text.default,
    listStyle: 'none',
    marginLeft: '1.5rem',
    fontWeight: 400,
    ...textSizes[17],
    [`@media (max-width: ${breakpoints.narrowWithGutters}px)`]: textSizes[15],
    [`@media (max-width: ${breakpoints.narrowMobile}px)`]: textSizes[14],
    'li:before': {
      content: '"•"',
      fontSize: '130%',
      lineHeight: 0,
      margin: '0 0.4rem 0 -1rem',
      position: 'relative',
      color: theme.text.default,
    },
  },
  ol: {
    fontFamily: fontStacks.book,
    color: theme.text.default,
    marginLeft: '1.5rem',
    fontWeight: 400,
    ...textSizes[17],
    [`@media (max-width: ${breakpoints.narrowWithGutters}px)`]: textSizes[15],
    [`@media (max-width: ${breakpoints.narrowMobile}px)`]: textSizes[14],
  },
  li: {
    padding: '0.25rem 0',
  },
  blockquote: {
    fontFamily: fontStacks.book,
    color: theme.text.default,
    fontWeight: 400,
    borderLeft: `4px solid #FF0000`,
    paddingLeft: '16px',
    ...textSizes[17],
    [`@media (max-width: ${breakpoints.narrowWithGutters}px)`]: textSizes[16],
    [`@media (max-width: ${breakpoints.narrowMobile}px)`]: textSizes[14],
  },
  footnote: {
    fontFamily: fontStacks.book,
    color: theme.text.default,
    ...textSizes[13],
    [`@media (max-width: ${breakpoints.narrowWithGutters}px)`]: textSizes[12],
  },
};
