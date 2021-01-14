import { StyleSheet } from 'react-native';

import { images } from '../images';
import { ImageTestGroup, ImageTestPropsFnInput } from '../types';
import { tintColor, tintColor2 } from './constants';

const defaultProps = {
  source: images.require_svg,
};

const svgTests: ImageTestGroup = {
  name: 'SVG support',
  tests: [
    {
      name: 'Plain',
      props: {
        ...defaultProps,
      },
    },
    {
      name: `Resize mode: cover`,
      props: {
        ...defaultProps,
        resizeMode: 'cover',
      },
    },
    {
      name: `Resize mode: contain`,
      props: {
        ...defaultProps,
        resizeMode: 'contain',
      },
    },
    {
      name: `Resize mode: stretch`,
      props: {
        ...defaultProps,
        resizeMode: 'stretch',
      },
    },
    {
      name: `Resize mode: center`,
      props: {
        ...defaultProps,
        resizeMode: 'center',
      },
    },
    {
      name: `Resize mode: repeat`,
      props: {
        ...defaultProps,
        resizeMode: 'repeat',
      },
    },
    {
      name: `No size`,
      props: {
        ...defaultProps,
        defaultStyle: {},
      },
    },
    {
      name: `Explicit size`,
      props: {
        ...defaultProps,
        defaultStyle: {},
        resizeMode: 'stretch',
        style: {
          backgroundColor: tintColor,
          width: 100,
          height: 30,
        },
      },
    },
    {
      name: 'Blur radius',
      props: ({ range }: ImageTestPropsFnInput) => ({
        ...defaultProps,
        blurRadius: range(0, 60),
      }),
    },
    {
      name: 'Border color',
      props: {
        ...defaultProps,
        style: {
          borderWidth: 5,
          borderColor: tintColor,
        },
      },
    },
    {
      name: 'Border width',
      props: ({ range }: ImageTestPropsFnInput) => ({
        ...defaultProps,
        style: {
          borderWidth: range(0, 20),
          borderColor: tintColor,
        },
      }),
    },
    {
      name: 'Border radius',
      props: ({ range }: ImageTestPropsFnInput) => ({
        ...defaultProps,
        style: {
          borderColor: tintColor,
          borderRadius: range(0, 100),
          borderWidth: StyleSheet.hairlineWidth,
        },
      }),
    },
    {
      name: 'Border radius: separate corners',
      props: ({ range }: ImageTestPropsFnInput) => ({
        ...defaultProps,
        style: {
          borderTopLeftRadius: range(0, 25),
          borderTopRightRadius: range(0, 50),
          borderBottomLeftRadius: range(0, 75),
          borderBottomRightRadius: range(0, 100),
          borderWidth: 5,
          borderColor: tintColor,
        },
      }),
    },
    {
      name: 'Borders: separate edges',
      props: ({ range }: ImageTestPropsFnInput) => ({
        ...defaultProps,
        style: {
          borderLeftWidth: range(0, 25),
          borderLeftColor: tintColor,
          borderTopWidth: range(0, 25),
          borderTopColor: tintColor2,
          borderRightWidth: range(0, 25),
          borderRightColor: tintColor,
          borderBottomWidth: range(0, 25),
          borderBottomColor: tintColor2,
        },
      }),
    },

    {
      name: 'Opacity',
      props: ({ range }: ImageTestPropsFnInput) => ({
        ...defaultProps,
        style: {
          opacity: range(0, 1),
        },
      }),
    },
    {
      name: 'Tint color',
      props: {
        ...defaultProps,
        style: {
          tintColor,
        },
      },
    },
    {
      name: 'Background color',
      props: {
        ...defaultProps,
        style: {
          backgroundColor: tintColor,
        },
      },
    },
    {
      name: 'Shadow',
      props: ({ range }: ImageTestPropsFnInput) => ({
        ...defaultProps,
        style: {
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: range(2, 5),
          },
          shadowOpacity: range(0.2, 0.5),
          shadowRadius: range(0, 10),
          elevation: range(0, 10),
        },
      }),
    },
  ],
};

export default svgTests;
