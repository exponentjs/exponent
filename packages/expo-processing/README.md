https://user-images.githubusercontent.com/379606/119428009-fb40c200-bcc0-11eb-8328-fb19e5d3557c.mp4

*NOTE: The recording above looks weird some times because of artifacts, the real thing is nice, I promise...*

# expo-processing

Use [Processing.js](http://processingjs.org) on [Expo](https://expo.io)! Just
`npm i -S processing-js expo-processing` in your Expo project and import it with
`import { ProcessingView } from 'expo-processing;`.

## Components

### `ExpoProcessing.ProcessingView`

Display a `Processing.js` sketch.

#### Props

The component accepts all `View` layout props for specifying its layout.

- `sketch`: A Processing.js sketch function that takes a `processing` instance
  and calls Processing.js functions on it, such as the [`sketchProc` function](http://processingjs.org/articles/jsQuickStart.html#javascriptonlyprocessingcode) in
  the Processing.js documentation for writing JavaScript-only Processing.js
  code.

## Example

This is based on
the ["In and out"](https://www.openprocessing.org/sketch/434617) sketch on
OpenProcessing.org.

In
a
[new blank Expo project](https://docs.expo.io/versions/v18.0.0/guides/up-and-running.html),
run `npm i -S processing-js expo-processing` to install Processing.js and ExpoProcessing. Then replace
`App.js` with the following:

```js
import React from 'react';
import { ProcessingView } from 'expo-processing';

export default class App extends React.Component {
  render() {
    return (
      <ProcessingView style={{ flex: 1 }} sketch={this._sketch} />
    );
  }

  _sketch = (p) => {
    p.setup = () => {
      p.strokeWeight(7);
    }

    const harom = (ax, ay, bx, by, level, ratio) => {
      if (level <= 0) {
        return;
      }

      const vx = bx - ax;
      const vy = by - ay;
      const nx = p.cos(p.PI / 3) * vx - p.sin(p.PI / 3) * vy;
      const ny = p.sin(p.PI / 3) * vx + p.cos(p.PI / 3) * vy;
      const cx = ax + nx;
      const cy = ay + ny;
      p.line(ax, ay, bx, by);
      p.line(ax, ay, cx, cy);
      p.line(cx, cy, bx, by);

      harom(
        ax * ratio + cx * (1 - ratio),
        ay * ratio + cy * (1 - ratio),
        ax * (1 - ratio) + bx * ratio,
        ay * (1 - ratio) + by * ratio,
        level - 1,
        ratio);
    }

    p.draw = () => {
      p.background(240);
      harom(
        p.width - 142, p.height - 142, 142, p.height - 142, 6,
        (p.sin(0.0005 * Date.now() % (2 * p.PI)) + 1) / 2);
    }
  }
}
````
