package expo.modules.calendar

import android.content.ContentValues
import org.unimodules.core.arguments.ReadableArguments

class AttendeeBuilder(
  private val attendeeDetails: ReadableArguments
) {
  private val attendeeValues = ContentValues()

  fun put(key: String, value: Int?) = apply {
    attendeeValues.put(key, value)
  }

  fun putString(detailsKey: String, detailsString: String) = apply {
    if (attendeeDetails.containsKey(detailsKey)) {
      attendeeValues.put(detailsString, attendeeDetails.getString(detailsKey))
    }
  }

  fun putString(detailsKey: String, detailsString: String, isRequired: Boolean) = apply {
    if (attendeeDetails.containsKey(detailsKey)) {
      attendeeValues.put(detailsString, attendeeDetails.getString(detailsKey))
    } else if (isRequired) {
      throw Exception("new attendees require `$detailsKey`")
    }
  }

  fun putString(detailsKey: String, detailsString: String, isRequired: Boolean?, mapper: (String) -> Int) = apply {
    if (attendeeDetails.containsKey(detailsKey)) {
      attendeeValues.put(detailsString, mapper(attendeeDetails.getString(detailsKey)))
    } else if (isRequired == true) {
      throw Exception("new attendees require `$detailsKey`")
    }
  }

  fun build() = attendeeValues
}
