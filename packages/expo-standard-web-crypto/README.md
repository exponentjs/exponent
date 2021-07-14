# expo-standard-crypto

A partial implementation of the W3C Crypto API for Expo

# API documentation

This package provides a partial polyfill of the W3C Crypto API for Expo. Namely, `Crypto#getRandomValues()` is implemented. See the [W3C Crypto specification](https://www.w3.org/TR/WebCryptoAPI/) for the API documentation.

# Installation in Expo projects

First follow the instructions for installing [`expo-random`](https://github.com/expo/expo/blob/master/packages/expo-random/README.md), which is required by this package. Then install this package.

### Add the package to your npm dependencies

```
npm install expo-standard-web-crypto
```

### Using the polyfill

There are two ways to use this package: you can import a `Crypto` instance or you can globally define `crypto`. Some code may expect the latter.

Importing a `Crypto` instance:

```js
import crypto from 'expo-standard-web-crypto';
```

Globally defining `crypto`:

```js
import { polyfillWebCrypto } from 'expo-standard-web-crypto';

polyfillWebCrypto();
// crypto is now globally defined
```

In either case, if your runtime environment already defines `crypto` globally, this package uses that instance instead of providing its own.

# Contributing

Contributions are very welcome! Please refer to guidelines described in the [contributing guide]( https://github.com/expo/expo#contributing).
