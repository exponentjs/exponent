import { css, CSSObject } from '@emotion/react';
import React, { HTMLAttributes } from 'react';

import { Link, LinkProps } from '~/ui/components/link';
import { textStyles } from '~/ui/foundations/typography';

export enum TextElements {
  CODE = 'code',
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
  H4 = 'h4',
  H5 = 'h5',
  LI = 'li',
  P = 'p',
  SPAN = 'span',
  UL = 'ul',
  OL = 'ol',
}

export type TextElementProps = HTMLAttributes<
  HTMLHeadingElement | HTMLParagraphElement | HTMLLIElement | HTMLUListElement
> & {
  testID?: string;
  size?: 'small' | 'medium' | 'large';
};

export function createTextComponent(Element: TextElements, textStyle?: CSSObject) {
  return (props: TextElementProps) => {
    const { className, testID, size, ...rest } = props;

    let sizeStyles;
    if (Element === TextElements.P && size) {
      const sizes = {
        small: css(textStyles.psmall),
        medium: css(textStyles.pmedium),
        large: css(textStyles.plarge),
      };

      sizeStyles = sizes[size];
    }

    return (
      <Element
        css={[css(textStyles[Element as keyof typeof textStyles]), sizeStyles, css(textStyle)]}
        className={className}
        data-testid={testID}
        {...rest}
      />
    );
  };
}

// todo(cedric): check with Jon if this is right, we want to use the right semantic element
export const H1 = createTextComponent(TextElements.H1, textStyles.h2);
export const H2 = createTextComponent(TextElements.H2, textStyles.h3);
export const H3 = createTextComponent(TextElements.H3, textStyles.h4);
export const H4 = createTextComponent(TextElements.H4, textStyles.h5);
export const H5 = createTextComponent(TextElements.H5, textStyles.h6);
export const P = createTextComponent(TextElements.P);
export const CODE = createTextComponent(TextElements.CODE);
export const UL = createTextComponent(TextElements.UL);
export const OL = createTextComponent(TextElements.OL);
export const LI = createTextComponent(TextElements.LI);
export const BOLD = createTextComponent(TextElements.SPAN, textStyles.pbold);
export const DEMI = createTextComponent(TextElements.SPAN, textStyles.pdemi);
export const NAV = createTextComponent(TextElements.P, textStyles.pnav);
export const SMALLCAPS = createTextComponent(TextElements.SPAN, textStyles.smallcaps);
export const LABEL = createTextComponent(TextElements.SPAN, textStyles.label);
export const HEADLINE = createTextComponent(TextElements.P, textStyles.headline);
export const FOOTNOTE = createTextComponent(TextElements.P, textStyles.footnote);

export const A = (props: Omit<LinkProps, 'router'> & { isStyled?: boolean }) => {
  const { isStyled, className, ...rest } = props;
  return (
    <Link css={css([textStyles.link, isStyled && textStyles.a])} className={className} {...rest} />
  );
};

export const PRE = (props: HTMLAttributes<HTMLPreElement>) => {
  const { className, ...rest } = props;
  return <pre css={css(textStyles.pre)} className={className} {...rest} />;
};
