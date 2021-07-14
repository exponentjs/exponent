package expo.modules.calendar

import android.content.ContentValues
import android.provider.CalendarContract
import android.text.TextUtils
import org.unimodules.core.arguments.ReadableArguments
import java.util.*

class CalendarEvenBuilder(
  private val eventDetails: ReadableArguments
) {
  private val eventValues = ContentValues()

  fun getAsLong(key: String): Long = eventValues.getAsLong(key)

  fun put(key: String, value: String) = apply {
    eventValues.put(key, value)
  }

  fun put(key: String, value: Int) = apply {
    eventValues.put(key, value)
  }

  fun put(key: String, value: Long) = apply {
    eventValues.put(key, value)
  }

  fun put(key: String, value: Boolean) = apply {
    eventValues.put(key, value)
  }

  fun putNull(key: String) = apply {
    eventValues.putNull(key)
  }

  fun checkIfContainsRequiredKeys(vararg keys: String) = apply {
    keys.forEach { checkDetailsContainsRequiredKey(it) }
  }

  fun putEventString(eventKey: String, detailsKey: String) = apply {
    if (eventDetails.containsKey(detailsKey)) {
      eventValues.put(eventKey, eventDetails.getString(detailsKey))
    }
  }

  fun putEventString(eventKey: String, detailsKey: String, mapper: (String) -> Int) = apply {
    if (eventDetails.containsKey(detailsKey)) {
      eventValues.put(eventKey, mapper(eventDetails.getString(detailsKey)))
    }
  }

  fun putEventBoolean(eventKey: String, detailsKey: String) = apply {
    if (eventDetails.containsKey(detailsKey)) {
      eventValues.put(eventKey, if (eventDetails.getBoolean(detailsKey)) 1 else 0)
    }
  }

  fun putEventBoolean(eventKey: String, detailsKey: String, value: Boolean) = apply {
    if (eventDetails.containsKey(detailsKey)) {
      eventValues.put(eventKey, value)
    }
  }

  fun putEventTimeZone(eventKey: String, detailsKey: String) = apply {
    eventValues.put(
      eventKey,
      if (eventDetails.containsKey(detailsKey)) {
        eventDetails.getString(detailsKey)
      } else {
        TimeZone.getDefault().id
      }
    )
  }

  fun <OutputListItemType> putEventDetailsList(eventKey: String, detailsKey: String, mappingMethod: (Any?) -> OutputListItemType) = apply {
    if (eventDetails.containsKey(eventKey)) {
      val array = eventDetails.getList(eventKey)
      val values = array.map {
        mappingMethod(it)
      }
      eventValues.put(detailsKey, TextUtils.join(",", values))
    }
  }

  private fun checkDetailsContainsRequiredKey(key: String) = apply {
    if (!eventDetails.containsKey(key)) {
      throw Exception("new calendars require $key")
    }
  }

  fun build() = eventValues
}
