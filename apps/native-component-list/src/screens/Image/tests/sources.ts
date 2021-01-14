import { images } from '../images';
import { ImageTestGroup } from '../types';

const imageTests: ImageTestGroup = {
  name: 'Sources',
  tests: [
    {
      name: `uri:.jpg (redirecting)`,
      props: {
        source: images.uri_random_unsplash,
      },
    },
    {
      name: `require(1.jpg)`,
      props: {
        source: images.require_jpg1,
      },
    },
    {
      name: `require(2.jpg)`,
      props: {
        source: images.require_jpg2,
      },
    },
    {
      name: `require(.png)`,
      props: {
        source: images.require_png,
      },
    },
    {
      name: `uri:.png`,
      props: {
        source: images.uri_png,
      },
    },
    {
      name: `uri:.jpg`,
      props: {
        source: images.uri_jpg,
      },
    },
    {
      name: `uri:.gif`,
      props: {
        source: images.uri_gif,
      },
    },
    {
      name: `uri:.ico`,
      props: {
        source: images.uri_ico,
      },
    },
    {
      name: `uri:.ico and intrinsic content size`,
      props: {
        defaultStyle: {},
        source: images.uri_ico,
      },
    },
    {
      name: `uri:.svg with text`,
      props: {
        source: images.uri_text_svg,
      },
    },
    {
      name: `uri:.svg`,
      props: {
        source: images.uri_youtube_svg,
        resizeMode: 'contain', // It just looks nicer :)
      },
    },
  ],
};

export default imageTests;
