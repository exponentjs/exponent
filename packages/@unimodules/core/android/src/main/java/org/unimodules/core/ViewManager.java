package org.unimodules.core;

import android.content.Context;
import android.view.View;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.unimodules.core.interfaces.RegistryLifecycleListener;
import org.unimodules.core.interfaces.ExpoProp;

public abstract class ViewManager<V extends View> implements RegistryLifecycleListener {
  /**
   * A helper class for passing information about prop setter so that
   * eg. adapter can infer the expected class of the property value.
   */
  public class PropSetterInfo {
    private Class<?> mExpectedPropertyClass;
    private boolean mAnimated;
    PropSetterInfo(Class<?>[] parameterTypes, boolean animated) {
      mExpectedPropertyClass = parameterTypes[parameterTypes.length - 1];
      mAnimated = animated;
    }

    public Class<?> getExpectedValueClass() {
      return mExpectedPropertyClass;
    }
    public boolean isAnimated() { return mAnimated; }
  }

  public enum ViewManagerType {
    SIMPLE,
    GROUP
  }

  private Map<String, PropSetterInfo> mPropSetterInfos;
  private Map<String, Method> mPropSetters;


  public abstract String getName();
  public abstract V createViewInstance(Context context);
  public abstract ViewManagerType getViewManagerType();

  public List<String> getExportedEventNames() {
    return Collections.emptyList();
  }

  public void onDropViewInstance(V view) {
    // by default do nothing
  }

  /**
   * Returns a map of { propName => propInfo } so that platform adapter knows value of what class
   * does the propsetter expect.
   */
  public Map<String, PropSetterInfo> getPropSetterInfos() {
    if (mPropSetterInfos != null) {
      return mPropSetterInfos;
    }

    Map<String, PropSetterInfo> propSetterInfos = new HashMap<>();
    for (Map.Entry<String, Method> entry : getPropSetters().entrySet()) {
      Method method = entry.getValue();
      ExpoProp propAnnotation = method.getAnnotation(ExpoProp.class);
      boolean animated = propAnnotation != null ? propAnnotation.animated() : false;
      propSetterInfos.put(entry.getKey(), new PropSetterInfo(method.getParameterTypes(), animated));
    }

    mPropSetterInfos = propSetterInfos;
    return mPropSetterInfos;
  }

  public void updateProp(V view, String propName, Object propValue) throws RuntimeException {
    Method propSetter = getPropSetters().get(propName);
    if (propSetter == null) {
      throw new IllegalArgumentException("There is no propSetter in " + getName() + " for prop of name " + propName + ".");
    }

    // We've validated parameter types length in getPropSetterInfos()
    Object transformedPropertyValue = transformArgumentToClass(propValue, getPropSetterInfos().get(propName).getExpectedValueClass());

    try {
      propSetter.invoke(this, view, transformedPropertyValue);
    } catch (IllegalAccessException | InvocationTargetException e) {
      throw new RuntimeException("Exception occurred while updating property " + propName
              + " on module " + getName() + ": " + e.getMessage(), e);
    }
  }

  protected Object transformArgumentToClass(Object argument, Class<?> expectedArgumentClass) {
    return ArgumentsHelper.validatedArgumentForClass(argument, expectedArgumentClass);
  }

  /**
   * Creates or returns a cached map of propName => methodSettingThatProp. Validates returned methods.
   * @return Map of { propName => methodSettingThatProp }
   */
  private Map<String, Method> getPropSetters() {
    if (mPropSetters != null) {
      return mPropSetters;
    }

    mPropSetters = new HashMap<>();
    Method[] declaredMethodsArray = getClass().getDeclaredMethods();

    for (Method method : declaredMethodsArray) {
      if (method.getAnnotation(ExpoProp.class) != null) {
        ExpoProp propAnnotation = method.getAnnotation(ExpoProp.class);
        String propName = propAnnotation.name();
        Class<?>[] methodParameterTypes = method.getParameterTypes();
        if (methodParameterTypes.length != 2) {
          throw new IllegalArgumentException(
                  "Expo prop setter should define at least two arguments: view and prop value. Propsetter for " + propName + " of module " + getName() + " does not define these arguments."
          );
        }

        if (mPropSetters.containsKey(propName)) {
          throw new IllegalArgumentException(
                  "View manager " + getName() + " prop setter name already registered: " + propName + "."
          );
        }

        mPropSetters.put(propName, method);
      }
    }

    return mPropSetters;
  }
}
