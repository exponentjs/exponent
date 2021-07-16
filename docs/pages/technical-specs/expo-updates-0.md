---
title: Expo Updates
sidebar_title: Expo Updates
---

Version 0

Updated 2021-05-24

---

## Introduction

This is the specification for Expo Updates, a protocol for delivering updates to Expo apps running on multiple platforms.

### Conformance

Conforming servers and client libraries must fulfill all normative requirements. Conformance requirements are described in this document by both descriptive assertions and key words with clearly defined meanings.

The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “MAY”, and “OPTIONAL” in the normative portions of this document are to be interpreted as described in [IETF RFC 2119](https://tools.ietf.org/html/rfc2119). These key words may appear in lowercase and still retain their meaning unless explicitly declared as non‐normative.

A conforming implementation of this protocol may provide additional functionality, but must not where explicitly disallowed or would otherwise result in non‐conformance.

### Overview

Conforming servers and client libraries MUST follow the HTTP spec as described in [RFC 7231](https://tools.ietf.org/html/rfc7231) as well as the more precise guidance described in this spec.

An _update_ is defined as a [_manifest_](#manifest-response) together with the assets referenced inside the manifest.
Expo Updates is a protocol for assembling and delivering updates to apps running on multiple platforms.

An app running a conformant Expo Updates client library MUST load the most recent update saved in the client library's cache, possibly after filtering by the contents of the manifest's [_metadata_](#manifest-response-body).

The following describes how a conformant Expo Updates client library MUST retrieve a new update from a conformant server:
1. The client library will make a [request](#request) for the most recent manifest, with constraints specified in the headers.
2. If a new manifest is downloaded, the client library will proceed to make additional requests to download and store any missing assets specified in the manifest.
3. The client library will edit its local state to reflect that a new update has been added to the local cache. It will also update the local state with the new `expo-manifest-filters` and `expo-server-defined-headers` found in the response [headers](#manifest-response-headers).

The primary consumers of this spec are Expo Application Services and organizations that wish to manage their own update server to satisfy internal requirements.

## Manifest Request
A conformant client library MUST make a GET request with the headers:

1. `expo-platform`, to specify the platform type the client is running on.
    * iOS MUST be `expo-platform: ios`.
    * Android MUST be `expo-platform: android`.
    * If it is not one of these platforms, the server SHOULD return a 400 or a 404
2. `expo-runtime-version` MUST be a runtime version compatible with the client. A runtime version stipulates the native code setup a client is running. It should be set when the client is built. For example, in an iOS client, the value may be set in a plist file.
3. Any headers stipulated by a previous responses' [server defined headers](#manifest-response-headers).

A conformant client library MUST also send at least one of `accept: application/expo+json` or `accept: application/json`, though SHOULD send `accept: application/expo+json, application/json` with the order following the preference ordering for the accept header specified in [RFC 7231](https://tools.ietf.org/html/rfc7231#section-5.3.2).

Example:
```
accept: application/expo+json, application/json
expo-platform: *
expo-runtime-version: *
```

## Manifest Response

A conformant server MUST return a response containing a [manifest body](#manifest-response-body) and [headers](#manifest-response-headers).

The choice of manifest and headers are dependent on the values of the request headers. A conformant server MUST:

* Respond with a manifest for the most recent update, ordered by creation time, satisfying all parameters and constraints imposed by the [request headers](#manifest-request). The server MAY use any properties of the request like its headers and source IP address to choose amongst several updates that all satisfy the request's constraints.

### Manifest Response Headers

```
expo-protocol-version: 0
expo-sfv-version: 0
expo-manifest-filters: &lt;expo-sfv&gt;
expo-server-defined-headers: &lt;expo-sfv&gt;
cache-control: *
content-type: *
```

* `expo-protocol-version` describes the version of the protocol defined in this spec and MUST be `0`.
* `expo-sfv-version`  MUST be `0`.
* `expo-manifest-filters` is an [Expo SFV](expo-sfv-0.md) dictionary. It is used to filter updates stored by the client library by the `metadata` attribute found in the [manifest](#manifest-response-body). If a field is mentioned in the filter, the corresponding field in the metadata must either be missing or equal for the update to be included. The client library MUST store the manifest filters until it is overwritten by a newer response.
* `expo-server-defined-headers` is an [Expo SFV](expo-sfv.md) dictionary. It defines headers that a client library MUST store until overwritten by a newer dictionary, and they MUST be included in every subsequent [manifest request](#manifest-request).
* `cache-control` - A value of `cache-control: private, max-age=0` is recommended to ensure the newest manifest is returned. Setting longer cache ages could result in stale updates.
* `content-type` MUST be determined by _proactive negotiation_ as defined in [RFC 7231](https://tools.ietf.org/html/rfc7231#section-3.4.1). Since the client library is [required](#manifest-request) to send an `accept` header with each manifest request, this will always be either `application/expo+json`, `application/json`; otherwise the request would return a `406` error.


The manifest endpoint MUST also be served with a `cache-control` header set to an appropriately short period of time. For example:

```
cache-control: max-age=0, private
```

### Manifest Response Body

The body of the response MUST be a manifest, which is defined as JSON conforming to both the following `Manifest` definition expressed in [TypeScript](https://www.typescriptlang.org/) and the detailed descriptions for each field:
```typescript
export type Manifest = {
  id: string;
  scopeKey: string;
  createdAt: string;
  runtimeVersion: string;
  launchAsset: Asset;
  assets: Asset[];
  metadata: { [key: string]: string };
  extra: { [key: string]: any };
}

type Asset = {
  hash: string;
  key: string;
  contentType: string;
  url: string;
}
```
  * `id`: The ID MUST uniquely specify the manifest.
  * `scopeKey`: A stable, unique, immutable string for scoping client-side data belonging to this project.
   * will not change when a project is transferred between accounts or renamed.
  * `createdAt`: The date and time at which the update was created is essential as the client library selects the most recent update (subject to any constraints supplied by the `expo-manifest-filters` header). The datetime should be formatted according to [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601).
  * `runtimeVersion`: Can be any string defined by the developer. It stipulates what native code setup is required to run the associated update.
  * `launchAsset`: A special asset that is the entry point of the application code.
  * `assets`: An array of assets used by the update bundle, such as JavaScript, pictures, and fonts. All assets (including the `launchAsset`) should be downloaded to disk before executing the the update, and a mapping of asset `key`s to locations on disk should be provided to application code.
  * Properties of each asset object:
    * `hash`: SHA-256 hash of the file to guarantee integrity.
    * `key`: Key used to reference this asset from the update's application code. This key, for example, may be generated by a separate build step that processes the application code, such as a bundler.
    * `contentType`: The MIME type of the file as defined by [RFC 2045](https://tools.ietf.org/html/rfc2045). e.g. `application/javascript`, `image/jpeg`.
    * `url`: Location at which the file may be fetched.
  * `metadata`: The metadata associated with an update. It is a string-valued dictionary. The server MAY send back anything it wishes to be used for filtering the updates. The metadata MUST pass the filter defined in the accompanying `expo-manifest-filters` header.
  * `extra`: For storage of optional "extra" information such as third-party configuration. For example, if the update is hosted on Expo Application Services (EAS), things like the EAS project ID, Expo Client config, and Expo Go config may be included:
  ```typescript
  extra: {
    eas: {
      projectId: '00000000-0000-0000-0000-000000000000'
    },
    expoClient: {
      description: '...',
      backgroundColor: '#000000',
      notification: {
        ...
      },
      ...
    },
    expoGo: {
      mainModuleName: '...',
      debuggerHost: '...',
      developer: {
        ...
      },
      ...
    }
    ...
  }
  ```

## Asset Request
A conformant client library MUST make a GET request to the asset URLs specified by the manifest. The client library SHOULD include a header accepting the asset's content type as specified in the manifest. Additionally, the client library SHOULD specify the compression encoding the client library is capable of handling.

Example headers:
```
accept: image/jpeg, */*
accept-encoding: br, gzip
```

## Asset Response

An asset located at a particular URL MUST NOT be changed or removed since client libraries may fetch assets for any update at any time.

### Asset Headers

The asset MUST be encoded using a compression format that the client supports according to the request's `accept-encoding` header. The server MAY serve uncompressed assets. The response MUST include a `content-type` header with the MIME type of the asset.
For example:
```
content-encoding: br
content-type: application/javascript
```

An asset is RECOMMENDED to be served with a `cache-control` header set to a long duration as an asset located at a given URL must not change. For example:

```
cache-control: public, max-age=31536000, immutable
```

### Compression

Assets SHOULD be capable of being served with [Gzip](https://www.gnu.org/software/gzip/) and [Brotli](https://github.com/google/brotli) compression.

## Client Library

See the [reference client library](https://github.com/expo/expo/tree/master/packages/expo-updates)
