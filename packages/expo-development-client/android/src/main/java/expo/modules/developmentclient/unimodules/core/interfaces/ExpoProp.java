package expo.modules.developmentclient.unimodules.core.interfaces;

import java.lang.annotation.Retention;

import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Retention(RUNTIME)
public @interface ExpoProp {
  String name();
}
