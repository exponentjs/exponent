package expo.modules.developmentclient.unimodules.core.interfaces;

public interface RuntimeEnvironmentInterface {
  String platformName();
  PlatformVersion platformVersion();

  interface PlatformVersion {
    int major();
    int minor();
    int patch();
    String prerelease();
  }
}
