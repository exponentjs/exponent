---
title: Testing with Jest
---

[Jest](https://jestjs.io) is the most widely used JavaScript unit testing framework, so you may be even be familiar with it already. This guide explains how to set up Jest in your project, write a unit test, write a snapshot test, and common problems that people encounter when using Jest in React Native.

## Installation

The first thing we'll want to do is install jest-expo, it's a Jest preset that mocks out the native side of the Expo SDK and handles some configuration for you.

To install jest-expo as a development dependency run: `yarn add jest-expo --dev` **or** `npm i jest-expo --save-dev`.

Then we need to add/update `package.json` to include:

```js
"scripts": {
  ...
  "test": "jest"
},
"jest": {
  "preset": "jest-expo"
}
```

Now let's add react-test-renderer to our project:

`yarn add react-test-renderer --dev` **or** `npm i react-test-renderer --save-dev`

That's it! Now we can start writing Jest tests!

> **Note**: [react-native-testing-library](https://github.com/callstack/react-native-testing-library) is a library built on top of react-test-renderer that could be helpful in your workflow, but we won't cover it in this guide.

## Jest Configuration

Jest comes with a lot of configuration options, for more details read [Configuring Jest](https://jestjs.io/docs/en/configuration.html).

We would like to point out [transformIgnorePatterns](https://jestjs.io/docs/configuration#transformignorepatterns-arraystring). Below is a great starting point to make sure any modules you may be using within `/node_modules/` are transpiled when running jest. This should cover the majority of your needs but you can always add to this pattern list as you see fit.

```js
"jest": {
  "preset": "jest-expo",
  "transformIgnorePatterns": [
    "node_modules/(?!(jest-)?react-native|react-clone-referenced-element|@react-native-community|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|@sentry/.*)"
  ]
}
```

## Unit Test

We are going to write a simple test for `App.js` by creating `App.test.js`. Jest will identify this as a test, and include it in the tests queue. There are other ways to [structure your tests](#structure-your-tests), but we will cover that later in this tutorial.

Our test will be the expected state of the `<App />` to have 1 child element:

```js
import React from 'react';
import renderer from 'react-test-renderer';

import App from './App';

describe('<App />', () => {
  it('has 1 child', () => {
    const tree = renderer.create(<App />).toJSON();
    expect(tree.children.length).toBe(1);
  });
});
```

Now run `yarn test` or `npm run test`, if all went well you should see 1 test passed! Read more on [expect and conditional matchers](https://jestjs.io/docs/en/expect).

## Snapshot Test

Now let's add a snapshot test for `App.js`. **What is a snapshot test, and why is it useful?** Snapshot tests are used to make sure the UI stays consistent, especially when a project is working with global styles that are potentially shared across components. Read more about it on Jest's site [snapshot testing](https://jestjs.io/docs/en/snapshot-testing).

Let's add the following within the describe():

```js
it('renders correctly', () => {
  const tree = renderer.create(<App />).toJSON();
  expect(tree).toMatchSnapshot();
});
```

Now run `yarn test` or `npm run test`, if all went well you should see a snapshot created and 2 tests passed!

This was a very simple test, for more information take a look at the following links:

- [Api: Globals](https://jestjs.io/docs/en/api)
- [Api: Mock Functions](https://jestjs.io/docs/en/mock-function-api)
- [Api: Expect](https://jestjs.io/docs/en/expect)
- [Cli Options](https://jestjs.io/docs/en/cli)

## Code Coverage Reports

Running tests are cool and all, but wouldn't you like to see your Expo projects total code coverage?! Maybe even see it in html format?! This section is for you!

Let's head back to `package.json` and add the following:

```js
"jest": {
  ...
  "collectCoverage": true,
  "collectCoverageFrom": [
    "**/*.{js,jsx}",
    "!**/coverage/**",
    "!**/node_modules/**",
    "!**/babel.config.js",
    "!**/jest.setup.js"
  ]
}
```

The above additions let's Jest know to collect coverage of all **_.js & .jsx_** file types and not within **_/coverage_**, **_/node_modules/_** and our 2 project config files (add/remove more exclusions to this list to match your Expo app needs).

Now run the test again, you should see **/coverage/** in your app directory! Find the `index.html` file within and double click to open it up in a browser. Not only do we have reporting in our cli, we also have an html version of our code coverage, pretty cool stuff!

> **Standards Note**: You can do what you want, but usually we wouldn't upload this html reporting to git; so add `coverage/\*\*/*` as a line in `.gitignore` to prevent this directory from being tracked.

## Structure your Tests

As promised, let's talk about how to set up the tests, right now we have a single `.test.js` in the root of our Expo project. This can get messy quickly, the easiest way is to create a `__tests__` directory (anywhere you'd like) and put all the tests there. For example see below:

```sh
__tests__/
├─ components/
│  └─ button.test.js
├─ navigation/
│  └─ mainstack.test.js
└─ screens/
   └─ home.test.js
src/
├─ components/
│  └─ button.js
├─ navigation/
│  └─ mainstack.js
└─ screens/
   └─ home.js
```

This **could** cause a lot of long import paths though (`../../src/components/button`), so another option would be to have multiple `__tests__` directories:

```sh
src/
├─ components/
├─ __tests__/
│  │  └─ button.test.js
│  └─ button.js
...
```

So if we move `__tests__` within `components`, the _button.test.js_ import of `<Button />` would now be: `../button`, that's a lot better!

Another option for test/file structure:

```sh
src/
├─ components/
│  ├─ button.js
│  ├─ button.style.js
│  └─ button.test.js
...
```

At the end of the day, it's all preference and up to you on how you'd like to structure things, but we wanted to share a few options to consider.

## Jest Flows

This is optional, but wanted to talk about different jest test flows. Currently we run the test and that's it, but take a look at the [Cli Options](https://jestjs.io/docs/en/cli). Below are a few script setups to try:

```js
"scripts": {
  ...
  // active development of tests, watch files for changes and re-runs all tests
  "test": "jest --watch --coverage=false --changedSince=origin/master",

  // debug, console.logs and only re-runs the file that was changed
  "testDebug": "jest -o --watch --coverage=false",

  // displays code coverage in cli and updates the code coverage html
  "testFinal": "jest",

  // when a screen/component is updated, the test snapshots will throw an error, this updates them
  "updateSnapshots": "jest -u --coverage=false"
}
```
