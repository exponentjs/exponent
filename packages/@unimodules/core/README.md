# @unimodules/core

## JavaScript installation

```sh
$ yarn add @unimodules/core

# or

$ npm install @unimodules/core --save
```

## Installation

If you are using `react-native-unimodules`, this package will already be installed and configured!

### iOS (Cocoapods)

If you're using Cocoapods, add the following dependency to your `Podfile`:

`pod 'UMCore', path: '../node_modules/@unimodules/core/ios'`

and run `npx pod-install`.

### Android

1.  Append the following lines to `android/settings.gradle`:
    ```gradle
    include ':unimodules-core'
    project(':unimodules-core').projectDir = new File(rootProject.projectDir, '../node_modules/@unimodules/core/android')
    ```
2.  Insert the following lines inside the dependencies block in `android/app/build.gradle`:
    ```gradle
    compile project(':unimodules-core')
    ```
3.  If you're using ProGuard, you'll need to append these lines to your ProGuard rules file for it not to strip out methods required for Expo modules to work.
    ```pro
    -keepclassmembers class * {
      @org.unimodules.interfaces.ExpoProp *;
    }
    -keepclassmembers class * {
      @org.unimodules.interfaces.ExpoMethod *;
    }
    ```

## Usage

### Glossary

- **Native code** — iOS/Android native code.
- **Client code** — code _over the bridge_, for React Native it's the JavaScript app.
- **Internal module** — a class implementing `UMInternalModule`/`org.unimodules.interfaces.InternalModule` interface. Its instance can be exposed internally to other modules via *Module Registry* (how dependants reference modules differs between platforms).
- **Module interface** — an interface that should be implemented by the dependency so it can act as an implementation of it.

    On Android modules implement an external interface (`expo-file-system` package implements interface provided by `expo-file-system-interface`). Dependants may access the implementations by calling
    ```java
    public <T> T getModule(Class<T> interfaceClass);
    ```
    method on the module registry.

    On iOS its the consumer who defines required protocol. Implementations are identified by a protocol. Dependants access the implementation by calling
    ```objc
    - (id)getModuleImplementingProtocol:(Protocol *)protocol;
    ```
    method on the module registry.
- **Module Registry** — well, a registry of modules. Instance of this class is used to fetch another internal or exported module.
- **Exported methods** — a subset of instance methods of a given module that should get exposed to client code by specific platform adapter.
- **Exported module** — a subclass of `{UM,org.unimodules.}ExportedModule`. Its methods annotated with `org.unimodules.ExpoMethod`/`UM_EXPORT_METHOD_AS` are exported to client code.
- **View manager** — a class capable of providing platform adapter with custom views.

### Registering modules in the registry

#### iOS

1. Open the header file for your module.
2. Import `<UMCore/UMInternalModule.h>`.
3. Add `UMModule` to a list of implemented interfaces by the module instances (eg. `NSObject <UMInternalModule>`). 
4. Open the implementation file for your module and implement methods required by the protocol.
5. Use `UM_REGISTER_MODULE();` macro to register the module.
6. That's it!

#### Android

1. Add `org.unimodules.interfaces.InternalModule` to your class's imports.
2. Make your module class implement `InternalModule` interface.
    1. Implement `public List<Class> getExportedInterfaces();`. Return a list of module interfaces implemented by the class, for example:
        ```java
        return Collections.singletonList((Class) org.unimodules.interfaces.filesystem.FileSystem.class);
        ```
3. Create a `Package` class for your module, unless you already have one.
    1. A `Package` class should implement `org.unimodules.Package` interface (a `BasePackage` class is provided for you not to have to implement all the initialization flavors at once).
    2. Add the `Package` to a `List` provided to `ModuleRegistryBuilder`.
        ```java
        new ModuleRegistryBuilder(
          Arrays.<Package>asList(
            new FileSystemPackage()
          )
        )
        ```
4. Add your module to be returned by `List<InternalModule> createInternalModules(Context context);`.
5. You're good to go!

### Exporting module to client code

#### iOS

When registering your module for export to client code, you must first decide whether the class will only be exported to client code or will it be both internal and exported module. If the former is applicable, you easily just subclass `UMExportedModule` and use macro `UM_EXPORT_MODULE(clientCodeName)` to provide a name under which it should be exported. If your module should be both internal and exported module, you also have to subclass `UMExportedModule`, but this time use `UM_REGISTER_MODULE()` in the implementation and then manually override methods `exportedInterfaces` and `exportedModuleName`.

#### Android

Subclass `org.unimodules.ExportedModule` and add your module to a list returned by `Package` in `createExportedModules()`.

### Exporting methods and calling exported methods

#### iOS

Use `UM_EXPORT_METHOD_AS(exportedName, definition)` macro to export given method to client code. Note that for the module to be available in the client code you have to provide a non-empty client code name in `UM_EXPORT_MODULE(clientCodeName)` or `- (const NSString *)exportedModuleName`. For now, arguments have to use basic, object types, like `NSString *`, `NSDictionary *`, `NSNumber *`. Methods are required to receive `UMPromiseResolveBlock` and `UMPromiseRejectBlock` as two last arguments.

#### Android

Given that your module subclasses `org.unimodules.ExportedModule` and it is returned by the respective `Package`, you just have to annotate the given method with `@ExpoMethod` annotation. Methods are required to receive `org.unimodules.Promise` as the last argument.

### Exporting constants to client code

#### iOS

Implement `- (NSDictionary *)constantsToExport` method to export constants to client code.

#### Android

Override `public Map<String, Object> getConstants();` method to export constants to client code.

### Creating a custom view manager

#### iOS

Subclass `UMViewManager` and override at least `- (UIView *)view` and `- (NSString *)viewName`. Register it with `UM_REGISTER_MODULE()`.

Use `UM_VIEW_PROPERTY(propName, propClass, viewClass)` to define custom view properties.

And use `UM_VIEW_PROPERTY_ANIMATED(propName, propClass, viewClass, viewPropPath, viewPropType)` to define view properties that can be animated natively.

#### Android

TODO: ViewManager from interface to a class

Implement `org.unimodules.interfaces.ViewManager` in your class and respond with its instance in `List<ViewManager> createViewManagers(Context context);` in corresponding `Package`.

Annotate prop setter methods with `@ExpoProp(name = <name>)` to define custom view properties.
