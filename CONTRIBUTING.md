# Contributing to the Expo SDK

- [📦 Download and Setup](#-download-and-setup)
- [✍️ Editing SDK Packages](#%EF%B8%8F-editing-sdk-packages)
  - [Style](#style)
  - [Extra Credit](#extra-credit)
- [⏱ Testing Your Changes](#-testing-your-changes)
  - [✅ Unit Testing](#-unit-testing)
  - [🏁 E2E Testing](#-e2e-testing)
- [📚 Updating Documentation](#-updating-documentation)
- [📝 Writing a Commit Message](#-writing-a-commit-message)
- [🔎 Before Submitting](#-before-submitting)
  - [Extra Credit](#extra-credit-1)

Thanks for the help! We currently review PRs for `packages/`, `docs/`, `templates/`, `guides/`, `apps/`, and markdown files.

Expo for Web code is easy to test and contribute to compared to the native code, and we welcome all contributions to it. You may find that some of the web features you are looking for actually live in the [expo-cli repo](https://github.com/expo/expo-cli).

We recommend that folks interested in contributing to the SDK use the `apps/bare-expo` project in their SDK development workflow instead of the Expo client. The Expo client itself (in the `ios/` and `android/` directories) are difficult to setup and require API tokens.

The `bare-expo` project includes most of the Expo SDK and runs the JavaScript code from `apps/test-suite` to allow you to easily write and run E2E tests for iOS, Android, and web for any given SDK package. Unit tests can be written within the SDK package itself. When pushed to the remote, CI will run this project with Detox for Android/iOS and Puppeteer for web and report the results on your pull request.

Manual smoke tests are included in `apps/native-component-list`, this is a good fit for demos or tests that require physical interactions. This is particularly useful if you are testing interactions with UI components, or there is something that is very difficult to test in an automated way but would be easy to verify through manual interaction.

> 💡 How does `bare-expo` relate to `test-suite`?
>
> `bare-expo` is a bare workflow app that links all of the Expo SDK dependencies in the `packages/` directory in order to be able to run projects in the `apps/` directory in the bare workflow rather than the Expo client. It currently only runs `test-suite`. `test-suite` is a regular managed workflow Expo app with some custom code to turn it into a test runner. If you run `expo start` in the `test-suite` directory you can load the project in Expo client. `bare-expo` imports the `test-suite` app root component and uses it as its own root component.

## 📦 Download and Setup

> 💽 The development environment for this repository does not support Windows. To contribute from Windows you must use WSL.

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device. (`git remote add upstream git@github.com:expo/expo.git` 😉). You can use `git clone --depth 1 --single-branch --branch master git@github.com:expo/expo.git`, discarding most of branches and history to clone it faster.
2. Ensure [direnv](https://direnv.net/) is installed on your computer.
3. Ensure [Node 14](https://nodejs.org/) is installed on your computer. (Check version with `node -v`)
4. If you will be working with the iOS project, ensure **ruby 2.7** is installed on your machine. macOS comes with ruby 2.6, which will give you issues; if you use homebrew you can just run `brew install ruby@2.7`.
5. Run the setup script with: `npm run setup:native` (if you just want to contribute to the docs, you can run `npm run setup:docs`). This command does the following for you:

   <!-- TODO(Bacon): Split this into 2 scripts so people can contribute to docs without installing React Native -->

   - Downloads submodules (like `react-native`) with `git submodule update --init`
   - Fetches files with [_git lfs_](https://git-lfs.github.com), which we use for big native libraries like Google Mobile Vision. Note: you must have `git lfs` already installed.
   - Ensures Yarn is installed
   - Ensures your computer is set up for React Native (will install the Android NDK if it's not present)
   - Downloads the Node packages (`yarn install`)

   Make sure that you're using Java 8 (e.g. OpenJDK 1.8.0_292). `ANDROID_SDK_ROOT`, `ANDROID_NDK_HOME` environmental variables should be set or configured via `local.properties` file in `android` folder of the native project you're working with.

6. Navigate to the bare sandbox project `cd apps/bare-expo`
7. Run the project on any platform (maybe start with web; it's the fastest! 😁)

   - Web: `yarn web`
   - iOS: `yarn ios`
   - Android: `yarn android`

8. You are now running the `test-suite` app via the `bare-expo` project. The next section explains how you can begin to make changes to SDK packages.

> If this didn't work for you as described, please [open an issue.](https://github.com/expo/expo/issues/new/choose)

## ✍️ Editing SDK Packages

All Expo SDK packages can be found in the `packages/` directory. These packages are automatically linked to the projects in the `apps/` directory, so you can edit them in-place and see the changes in the running app.

 <!-- (meaning any iOS, Android, web, or API changes can be tested from `apps/bare-expo/`). -->

1. Navigate to a package you want to edit. Ex: `cd packages/expo-constants`
2. Start the TypeScript build in watch mode: `yarn build`
3. Edit code in that package's `src/` directory
4. Play with your changes on a simulator or device through `bare-expo`:
   - Add or modify a file named after the API you're working on. Ex: `apps/test-suite/tests/Constants.js`
   - To see native changes, you will need to run the `test-suite` with the `apps/bare-expo` project using `yarn <android | ios | web>`.
   - If you are only making JavaScript changes, you can run `test-suite` from the `apps/test-suite` project using `expo start`.
   - To run the full test suite with Puppeteer or Detox, you can run the tests `yarn test:<android | ios | web>`.
5. You can edit a package's native code directly from its respective folder in the `packages/` directory or by opening `bare-expo` in a native editor:
   - `cd apps/bare-expo`
   - Android Studio: `yarn edit:android`
   - Xcode: `yarn edit:ios`
   - Remember to **rebuild** the native project whenever you make a native change

### Style

All modules should adhere to the style guides which can be found here:

- [Guide to Unimodule Development](guides/Expo%20Universal%20Module%20Infrastructure.md)
- [Expo JS Style Guide](guides/Expo%20JavaScript%20Style%20Guide.md) (also mostly applies to TypeScript)
- [Updating Changelogs](guides/contributing/Updating%20Changelogs.md)

### Extra Credit

- The React Native dev tools are currently disabled in our fork [#5602](https://github.com/expo/expo/issues/5602). You can hack around this by cloning React Native outside this repo, then copying the contents `react-native/React/DevSupport` into `expo/react-native-lab/react-native/React/DevSupport` (this will only enable the shake gesture, CMD+R won't work yet).
- We use a fork of `react-native` in this repo; this fork is located at `react-native-lab/react-native` (you can make changes or cherry-picks from here if you want). It diverges the minimal amount necessary from the `react-native` version in its `package.json`.
- All of the package's `build/` code should be committed. This is because it is simpler to reproduce issues if all contributors are running the same code and so we don't need to rebuild dozen of packages locally on every `git pull` or `git checkout` operation.
- We use a unified set of basic Bash scripts and configs called `expo-module-scripts` to ensure everything runs smoothly (TypeScript, Babel, Jest, etc...).

## ⏱ Testing Your Changes

> You'll need write about how you tested your changes in the PR under the **Test Plan** section.

The best way to get your changes merged is to build good tests for them! We have three different kinds of tests: unit-tests, automated E2E tests, and demos (adding tests that you notice are missing is a great way to become my friend 🥳)!

### ✅ Unit Testing

1. Create a test for your feature in the appropriate package's `src/__tests__` directory (if the file doesn't exist already, create it with the `*-test.ts` or `*-test.tsx` extension).
2. Any new bridged native functions have to be added to the [jest-expo](https://github.com/expo/expo/blob/master/packages/jest-expo/src/preset/expoModules.js) package to ensure they are mocked. To help you do this more easily, we've written a tool and a guide on how to do this. Check out [Generating Jest Mocks](https://github.com/expo/expo/blob/master/guides/Generating%20Jest%20Mocks.md)!
3. Run the test with `yarn test` and ensure it handles all platforms (iOS, Android, and web). If the feature doesn't support a platform, then you can exclude it by putting your test in a file with a platform extension like: `-test.ios.ts`, `-test.native.ts`, `-test.web.ts`...
4. You can also test platforms one at a time by pressing <kbd>X</kbd> and selecting the platform you want to test!

### 🏁 E2E Testing

1. Write your tests in `apps/test-suite/tests`
   - These tests are written with a non-feature-complete version of Jasmine that runs on the Android and iOS clients, so no special features like snapshot testing will be available.
   - If you created a new test file, be sure to add it in `apps/test-suite/TestUtils.js`. This is where you can do platform exclusion. Use `global.DETOX` to test for iOS tests, and `ExponentTest.isInCI` to test for Android Device Farm.
2. Run your tests locally from the `bare-expo` directory with `yarn test:android`, `yarn test:ios`, or `yarn test:web`.
   - It's important you test locally because native CI tests can be fragile, take a while to finish, and be frustrating when they fail.
   - When testing for web, you can set `headless: false` in the `apps/bare-expo/jest-puppeteer.config.js` to watch the tests live. You can also execute `await jestPuppeteer.debug();` in `apps/bare-expo/e2e/TestSuite-test.web.js` to pause the tests and debug them!
3. Remember to try and get your feature running on as many platforms as possible.

Thanks again for helping to make sure that Expo is stable for everyone!

## 📚 Updating Documentation

Our docs are made with [Next.js](https://github.com/zeit/next.js). They're located in the `docs/` directory. For more information look at the [`docs/readme.md`](/docs/README.md).

**TL;DR:**

1. Navigate to the `docs/` directory and run `yarn`.
2. Start the project with `yarn dev` (make sure you don't have another server running on port `3000`).
3. Navigate to the docs you want to edit: `cd docs/pages/versions/unversioned/`
4. If you update an older version, ensure the relevant changes are copied into `unversioned/`

## 📝 Writing a Commit Message

> If this is your first time committing to a large public repo, you could look through this neat tutorial: ["How to Write a Git Commit Message"](https://chris.beams.io/posts/git-commit/)

Commit messages are most useful when formatted like so: `[platform][api] Title`. For example if you fix a bug in the package `expo-video` for iOS, you could write: `[ios][video] Fixed black screen bug that appears on older devices`.

## 🔎 Before Submitting

To help keep CI green, please make sure of the following:

- Remember to add a concise description of any user-facing changes to `CHANGELOG.md` file in the package you've changed or [root's CHANGELOG.md](/CHANGELOG.md) if your changes don't apply to any package. This is especially helpful for breaking changes!
- If you modified anything in `packages/`:
  - You transpiled the TypeScript with `yarn build` in the directory of whichever package you modified.
  - Run `yarn lint --fix` to fix the formatting of the code. Ensure that `yarn lint` succeeds without errors or warnings.
  - Run `yarn test` to ensure all existing tests pass for that package, along with any new tests you would've written.
  - All `console.log`s or commented out code blocks are removed! :]
- If you edited the `docs/`:
  - Any change to the current SDK version should also be in the unversioned copy as well. Example:
    - You fixed a typo in `docs/pages/versions/vXX.0.0/sdk/app-auth.md`
    - Ensure you copy that change to: `docs/pages/versions/unversioned/sdk/app-auth.md`
  - You don't need to run the docs tests locally. Just ensure the links you include aren't broken, and the format is correct!

### Extra Credit

- Our CI tests will finish early if you didn't make changes to certain directories. If you want to **get results faster** then you should make changes to `docs/` in one PR, and changes to anything else in another!
