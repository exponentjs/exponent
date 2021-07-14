package org.unimodules.core.interfaces;

import java.lang.annotation.Retention;

import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Retention(RUNTIME)
public @interface ExpoProp {
  String name();
  boolean animated() default false; ;
}
