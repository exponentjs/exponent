import { ImageTestGroup } from '../types';
import AndroidTests from './android';
import AppearanceTests from './appearance';
import BorderTests from './borders';
import EventTests from './events';
import IOSTests from './ios';
import ShadowsTests from './shadows';
import SourcesTests from './sources';
import SVGTests from './svg';

const tests: ImageTestGroup = {
  name: 'Image',
  tests: [
    AppearanceTests,
    BorderTests,
    ShadowsTests,
    SourcesTests,
    SVGTests,
    EventTests,
    IOSTests,
    AndroidTests,
  ],
};

export default tests;
