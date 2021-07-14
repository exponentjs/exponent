---
title: React vs React Native
---

On the surface, there's very little difference between React and React Native- that's one of the great parts about React Native (RN for short). If you're a web developer and have used React, good news- you're (almost) a React Native pro! That being said, React and RN are separate and distinct tools, and like all great tools, they've each been built for a specific purpose in mind. Let's go over some of their similarities, differences, and where each of them shines brightest.

## Similarities

### JSX

Both React and RN are written in the JSX syntax extension of javascript. JSX is great because it encourages the use of reusable components in your code, and also allows you to [separate concerns](https://en.wikipedia.org/wiki/Separation_of_concerns) based on these components. So, rather than your markup, logic, and CSS all in different files, you can instead wrap it all together in individual comoponents. And if you're smart- you can reuse those same components across your codebase (and even across wholly different codebases!)

All that, plus JSX tends to be really helpful as a visual aid when working with UI.

[Learn more about JSX here](https://reactjs.org/docs/introducing-jsx.html).

### Components, props, state, and lifecycle

As stated earlier, React and RN both encourage the use of components, which helps you to organize your code into reusable pieces. These components accept inputs called "props" which dictate that components behavior or UI.

Additionally, components can have a notion of "state" or data that component is keeping track of for some reason. One example of this would be a clock that needs to keep track of seconds passing so that it can move the hands.

Finally, components adhere to certain "lifecycle" events, which are basically just opportunities for you to program in actions the component should take. Like "when the component is about to be rendered on the screen, do X."

Best news- this is all the same in React and RN, so if you've learned one, you know the other. You can refer to React's documentation for more information on [components and props](https://reactjs.org/docs/components-and-props.html) and [state and lifecycle events](https://reactjs.org/docs/state-and-lifecycle.html).

### Community

Both React and RN have very strong communities, which is great for a host of reasons, including:

- great community support in places like Stack Overflow, Discord, Slack, etc.
- plenty of libraries built & maintained by the community that make React and RN even better, and there's more libraries to choose from every day
- strong communities are usually a good indicator of project's health, and it's lifetime, so these tools are around for the long haul

### Open source

Both React and RN are open-sourced from Facebook, meaning you can read all the code and even submit potential fixes or changes! The Expo SDK is also 100% open source. Feel free to take a look through the:

- [React source](https://github.com/facebook/react)
- [React Native source](https://github.com/facebook/react-native)
- [Expo SDK source](https://github.com/expo/expo)

## Differences

Now that we've covered the similarities, what are some ways in which React and React Native are different?

### Target platforms

The main difference is that React is meant for building _web_ applications, whereas React Native is meant for building native iOS and Android applications, as well as web apps (all with one codebase)! With React Native, you are still building a native application (under the hood, your app uses the same iOS and Android APIs that purely native apps written in Swift or Kotlin do).

### Syntax differences

With React, you're probably used to using `<div></div>` and `<p></p>`, but with React Native you'll use a new set of components like `<View></View>` and `<Text></Text>`, but as you can see, it's pretty intuitive.

### Design

One final thing to note is that writing mobile apps is very different from websites; you think more in terms of screens and different navigators instead of separate web pages (luckily there are plenty of libaries to help you out there, like [`react-navigation`](https://reactnavigation.org/). That being said, much more of your knowledge from React carries over than if you were writing a traditional Android or iOS app.

## Should I use React or React Native?

Well, if you'd like to write a mobile app, then the obvious choice is React Native. If you're just writing a website, then you should consider both options. Web support in React Native is still early, so if you're _only_ targeting web, you'll likely have an easier time sticking to just React. But if you take the road less traveled, by the end of it all you'll have a cross-platform mobile app for free, in addition to your new website!
