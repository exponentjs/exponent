---
title: Ejecting from Managed Workflow
hideTOC: true
---

The [managed workflow](../introduction/managed-vs-bare.md#managed-workflow) has [its limitations](../introduction/why-not-expo.md), and if you find yourself running up against them then you can either attempt to work around the limitations by exploring alternate solutions that will work within the constraints (eg: moving work to a server if no API exists to do it on the client) or you can eject to the [bare workflow](../introduction/managed-vs-bare.md#bare-workflow) and have full access to the underlying native projects.

The process of ejecting is easily reversible so don't worry about experimenting with it. Just commit any changes you want to keep and then follow along with this guide. If you decide you want to abort it, just check out your most recent commit. You can also reverse it in the future by deleting the `ios` and `android` directories.

To eject to the bare workflow, you can run `expo eject` and follow the instructions. Head over to the [bare workflow walkthrough](../bare/exploring-bare-workflow.md) to learn more about what the workflow will look like after ejecting.

> 💡 We recommend upgrading to the latest SDK version before ejecting. It will be more difficult to upgrade your app after ejecting because you will also be responsible for native iOS and Android related upgrade steps.
