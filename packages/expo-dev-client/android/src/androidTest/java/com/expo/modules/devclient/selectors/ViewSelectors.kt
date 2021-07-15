package com.expo.modules.devclient.selectors

import android.view.View
import androidx.test.espresso.matcher.ViewMatchers
import androidx.test.espresso.matcher.ViewMatchers.withEffectiveVisibility
import androidx.test.espresso.matcher.ViewMatchers.withTagValue
import org.hamcrest.Matcher
import org.hamcrest.Matchers.`is`
import org.hamcrest.Matchers.allOf

internal object ViewSelectors {
  fun withTaggedView(id: String): Matcher<View?> {
    return allOf(withTagValue(`is`(id)), withEffectiveVisibility(ViewMatchers.Visibility.VISIBLE))
  }
}
