package expo.modules.calendar

import android.Manifest
import android.content.ContentUris
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.database.Cursor
import android.os.Bundle
import android.provider.CalendarContract
import android.util.Log
import expo.modules.interfaces.permissions.Permissions
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import org.unimodules.core.ExportedModule
import org.unimodules.core.ModuleRegistry
import org.unimodules.core.ModuleRegistryDelegate
import org.unimodules.core.Promise
import org.unimodules.core.arguments.ReadableArguments
import org.unimodules.core.errors.InvalidArgumentException
import org.unimodules.core.interfaces.ExpoMethod
import org.unimodules.core.interfaces.RegistryLifecycleListener
import java.text.ParseException
import java.text.SimpleDateFormat
import java.util.*
import kotlin.collections.ArrayList

class CalendarModule(
  private val mContext: Context,
  private val moduleRegistryDelegate: ModuleRegistryDelegate = ModuleRegistryDelegate(),
) : ExportedModule(mContext), RegistryLifecycleListener {
  private val mPermissions: Permissions by moduleRegistry()
  private val moduleCoroutineScope = CoroutineScope(Dispatchers.Default)
  private val contentResolver
    get() = mContext.contentResolver

  private val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").apply {
    timeZone = TimeZone.getTimeZone("GMT")
  }

  override fun getName() = "ExpoCalendar"

  private inline fun <reified T> moduleRegistry() = moduleRegistryDelegate.getFromModuleRegistry<T>()

  override fun onCreate(moduleRegistry: ModuleRegistry) {
    moduleRegistryDelegate.onCreate(moduleRegistry)
  }

  override fun onDestroy() {
    try {
      moduleCoroutineScope.cancel(ModuleDestroyedException())
    } catch (e: IllegalStateException) {
      Log.e(TAG, "The scope does not have a job in it")
    }
  }

  private inline fun launchAsyncWithModuleScope(promise: Promise, crossinline block: () -> Unit) {
    moduleCoroutineScope.launch {
      try {
        block()
      } catch (e: ModuleDestroyedException) {
        promise.reject("E_CALENDAR_MODULE_DESTROYED", "Module destroyed, promise canceled")
      }
    }
  }

  private inline fun withPermissions(promise: Promise, block: () -> Unit) {
    if (!checkPermissions(promise)) {
      return
    }
    block()
  }

  //region Exported methods
  @ExpoMethod
  fun getCalendarsAsync(type: String?, promise: Promise) = withPermissions(promise) {
    if (type != null && type == "reminder") {
      promise.reject("E_CALENDARS_NOT_FOUND", "Calendars of type `reminder` are not supported on Android")
      return
    }
    launchAsyncWithModuleScope(promise) {
      try {
        val calendars = findCalendars()
        promise.resolve(calendars)
      } catch (e: Exception) {
        promise.reject("E_CALENDARS_NOT_FOUND", "Calendars could not be found", e)
      }
    }
  }

  @ExpoMethod
  fun saveCalendarAsync(details: ReadableArguments, promise: Promise) = withPermissions(promise) {
    launchAsyncWithModuleScope(promise) {
      try {
        val calendarID = saveCalendar(details)
        promise.resolve(calendarID.toString())
      } catch (e: Exception) {
        promise.reject("E_CALENDAR_NOT_SAVED", "Calendar could not be saved: " + e.message, e)
      }
    }
  }

  @ExpoMethod
  fun deleteCalendarAsync(calendarID: String, promise: Promise) = withPermissions(promise) {
    launchAsyncWithModuleScope(promise) {
      val successful = deleteCalendar(calendarID)
      if (successful) {
        promise.resolve(null)
      } else {
        promise.reject("E_CALENDAR_NOT_DELETED", "Calendar with id $calendarID could not be deleted")
      }
    }
  }


  @ExpoMethod
  fun getEventsAsync(startDate: Any, endDate: Any, calendars: List<String>, promise: Promise) = withPermissions(promise) {
    launchAsyncWithModuleScope(promise) {
      try {
        val results = findEvents(startDate, endDate, calendars)
        promise.resolve(results)
      } catch (e: Exception) {
        promise.reject("E_EVENTS_NOT_FOUND", "Events could not be found", e)
      }
    }
  }

  @ExpoMethod
  fun getEventByIdAsync(eventID: String, promise: Promise) = withPermissions(promise) {
    launchAsyncWithModuleScope(promise) {
      val results = findEventById(eventID)
      if (results != null) {
        promise.resolve(results)
      } else {
        promise.reject("E_EVENT_NOT_FOUND", "Event with id $eventID could not be found")
      }
    }
  }


  @ExpoMethod
  fun saveEventAsync(details: ReadableArguments, options: ReadableArguments?, promise: Promise) = withPermissions(promise) {
    launchAsyncWithModuleScope(promise) {
      try {
        val eventID = saveEvent(details)
        promise.resolve(eventID.toString())
      } catch (e: ParseException) {
        promise.reject("E_EVENT_NOT_SAVED", "Event could not be saved", e)
      } catch (e: EventNotSavedException) {
        promise.reject("E_EVENT_NOT_SAVED", "Event could not be saved", e)
      } catch (e: InvalidArgumentException) {
        promise.reject("E_EVENT_NOT_SAVED", "Event could not be saved", e)
      }
    }
  }

  @ExpoMethod
  fun deleteEventAsync(details: ReadableArguments, options: ReadableArguments?, promise: Promise) = withPermissions(promise) {
    launchAsyncWithModuleScope(promise) {
      try {
        val successful = removeEvent(details)
        if (successful) {
          promise.resolve(null)
        } else {
          promise.reject("E_EVENT_NOT_DELETED", "Event with id ${details.getString("id")} could not be deleted")
        }
      } catch (e: Exception) {
        promise.reject("E_EVENT_NOT_DELETED", "Event with id ${details.getString("id")} could not be deleted", e)
      }
    }
  }

  @ExpoMethod
  fun getAttendeesForEventAsync(eventID: String, promise: Promise) = withPermissions(promise) {
    launchAsyncWithModuleScope(promise) {
      val results = findAttendeesByEventId(eventID)
      promise.resolve(results)
    }
  }

  @ExpoMethod
  fun saveAttendeeForEventAsync(details: ReadableArguments, eventID: String?, promise: Promise) = withPermissions(promise) {
    launchAsyncWithModuleScope(promise) {
      try {
        val attendeeID = saveAttendeeForEvent(details, eventID)
        promise.resolve(attendeeID.toString())
      } catch (e: Exception) {
        promise.reject("E_ATTENDEE_NOT_SAVED", "Attendees for event with id $eventID could not be saved", e)
      }
    }
  }

  @ExpoMethod
  fun deleteAttendeeAsync(attendeeID: String, promise: Promise) = withPermissions(promise) {
    launchAsyncWithModuleScope(promise) {
      val successful = deleteAttendee(attendeeID)
      if (successful) {
        promise.resolve(null)
      } else {
        promise.reject("E_ATTENDEE_NOT_DELETED", "Attendee with id $attendeeID could not be deleted")
      }
    }
  }

  @ExpoMethod
  fun openEventInCalendar(eventID: Int, promise: Promise) {
    val uri = ContentUris.withAppendedId(CalendarContract.Events.CONTENT_URI, eventID.toLong())
    val sendIntent = Intent(Intent.ACTION_VIEW).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK).setData(uri)
    if (sendIntent.resolveActivity(mContext.packageManager) != null) {
      mContext.startActivity(sendIntent)
    }
    promise.resolve(null)
  }

  @ExpoMethod
  fun requestCalendarPermissionsAsync(promise: Promise?) {
    mPermissions.askForPermissionsWithPromise(promise, Manifest.permission.READ_CALENDAR, Manifest.permission.WRITE_CALENDAR)
  }

  @ExpoMethod
  fun getCalendarPermissionsAsync(promise: Promise) {
    mPermissions.getPermissionsWithPromise(promise, Manifest.permission.READ_CALENDAR, Manifest.permission.WRITE_CALENDAR)
  }

  //endregion
  @Throws(SecurityException::class)
  private fun findCalendars(): List<Bundle> {
    val uri = CalendarContract.Calendars.CONTENT_URI
    val cursor = contentResolver.query(uri, findCalendarsQueryParameters, null, null, null)
    requireNotNull(cursor) { "Cursor shouldn't be null" }
    return cursor.use(::serializeEventCalendars)
  }

  private fun findEvents(startDate: Any, endDate: Any, calendars: List<String>): List<Bundle> {
    val eStartDate = Calendar.getInstance()
    val eEndDate = Calendar.getInstance()
    try {
      setDateInCalendar(eStartDate, startDate)
      setDateInCalendar(eEndDate, endDate)
    } catch (e: ParseException) {
      Log.e(TAG, "error parsing", e)
    } catch (e: Exception) {
      Log.e(TAG, "misc error parsing", e)
    }
    val uriBuilder = CalendarContract.Instances.CONTENT_URI.buildUpon()
    ContentUris.appendId(uriBuilder, eStartDate.timeInMillis)
    ContentUris.appendId(uriBuilder, eEndDate.timeInMillis)
    val uri = uriBuilder.build()
    var selection =
      "((${CalendarContract.Instances.BEGIN} >= ${eStartDate.timeInMillis}) " +
        "AND (${CalendarContract.Instances.END} <= ${eEndDate.timeInMillis}) " +
        "AND (${CalendarContract.Instances.VISIBLE} = 1) "
    if (calendars.isNotEmpty()) {
      var calendarQuery = "AND ("
      for (i in calendars.indices) {
        calendarQuery += CalendarContract.Instances.CALENDAR_ID + " = '" + calendars[i] + "'"
        if (i != calendars.size - 1) {
          calendarQuery += " OR "
        }
      }
      calendarQuery += ")"
      selection += calendarQuery
    }
    selection += ")"
    val cursor = contentResolver.query(
      uri,
      findEventsQueryParameters,
      selection,
      null,
      null
    )

    requireNotNull(cursor) { "Cursor shouldn't be null" }
    return cursor.use(::serializeEvents)
  }

  private fun findEventById(eventID: String): Bundle? {
    val uri = ContentUris.withAppendedId(CalendarContract.Events.CONTENT_URI, eventID.toInt().toLong())
    val selection = "((${CalendarContract.Events.DELETED} != 1))"
    val cursor = contentResolver.query(
      uri,
      findEventByIdQueryParameters,
      selection,
      null,
      null
    )
    requireNotNull(cursor) { "Cursor shouldn't be null" }
    return cursor.use {
      if (cursor.count > 0) {
        cursor.moveToFirst()
        serializeEvent(cursor)
      } else {
        null
      }
    }
  }

  private fun findCalendarById(calendarID: String): Bundle? {
    val uri = ContentUris.withAppendedId(CalendarContract.Calendars.CONTENT_URI, calendarID.toInt().toLong())
    val cursor = contentResolver.query(
      uri,
      findCalendarByIdQueryFields,
      null,
      null,
      null
    )
    requireNotNull(cursor) { "Cursor shouldn't be null" }
    return cursor.use {
      if (it.count > 0) {
        it.moveToFirst()
        serializeEventCalendar(it)
      } else {
        null
      }
    }
  }

  private fun findAttendeesByEventId(eventID: String): List<Bundle> {
    val cursor = CalendarContract.Attendees.query(
      contentResolver,
      eventID.toLong(),
      findAttendeesByEventIdQueryParameters
    )
    return cursor.use(::serializeAttendees)
  }

  @Throws(Exception::class)
  private fun saveCalendar(details: ReadableArguments): Int {
    val calendarEventBuilder = CalendarEvenBuilder(details)

    calendarEventBuilder
      .putEventString(CalendarContract.Calendars.NAME, "name")
      .putEventString(CalendarContract.Calendars.CALENDAR_DISPLAY_NAME, "title")
      .putEventBoolean(CalendarContract.Calendars.VISIBLE, "isVisible")
      .putEventBoolean(CalendarContract.Calendars.SYNC_EVENTS, "isSynced")

    return if (details.containsKey("id")) {
      val calendarID = details.getString("id").toInt()
      val updateUri = ContentUris.withAppendedId(CalendarContract.Calendars.CONTENT_URI, calendarID.toLong())
      contentResolver.update(updateUri, calendarEventBuilder.build(), null, null)
      calendarID
    } else {
      calendarEventBuilder.checkIfContainsRequiredKeys(
        "name",
        "title",
        "source",
        "color",
        "accessLevel",
        "ownerAccount"
      )
      val source = details.getArguments("source")
      if (!source.containsKey("name")) {
        throw Exception("new calendars require a `source` object with a `name`")
      }
      var isLocalAccount = false
      if (source.containsKey("isLocalAccount")) {
        isLocalAccount = source.getBoolean("isLocalAccount")
      }
      if (!source.containsKey("type") && !isLocalAccount) {
        throw Exception("new calendars require a `source` object with a `type`, or `isLocalAccount`: true")
      }

      calendarEventBuilder
        .put(CalendarContract.Calendars.ACCOUNT_NAME, source.getString("name"))
        .put(CalendarContract.Calendars.ACCOUNT_TYPE, if (isLocalAccount) CalendarContract.ACCOUNT_TYPE_LOCAL else source.getString("type"))
        .put(CalendarContract.Calendars.CALENDAR_COLOR, details.getInt("color"))
        .put(CalendarContract.Calendars.CALENDAR_ACCESS_LEVEL, calAccessConstantMatchingString(details.getString("accessLevel")))
        .put(CalendarContract.Calendars.OWNER_ACCOUNT, details.getString("ownerAccount"))
        // end required fields
        .putEventTimeZone(CalendarContract.Calendars.CALENDAR_TIME_ZONE, "timeZone")
        .putEventDetailsList(CalendarContract.Calendars.ALLOWED_REMINDERS, "allowedReminders") { reminderConstantMatchingString(it as String?) }
        .putEventDetailsList(CalendarContract.Calendars.ALLOWED_AVAILABILITY, "allowedAvailabilities") { availabilityConstantMatchingString(it as String) }
        .putEventDetailsList(CalendarContract.Calendars.ALLOWED_ATTENDEE_TYPES, "allowedAttendeeTypes") { attendeeTypeConstantMatchingString(it as String) }

      val uriBuilder = CalendarContract.Calendars.CONTENT_URI
        .buildUpon()
        .appendQueryParameter(CalendarContract.CALLER_IS_SYNCADAPTER, "true")
        .appendQueryParameter(CalendarContract.Calendars.ACCOUNT_NAME, source.getString("name"))
        .appendQueryParameter(CalendarContract.Calendars.ACCOUNT_TYPE, if (isLocalAccount) CalendarContract.ACCOUNT_TYPE_LOCAL else source.getString("type"))

      val calendarsUri = uriBuilder.build()
      val calendarUri = contentResolver.insert(calendarsUri, calendarEventBuilder.build())
      calendarUri!!.lastPathSegment!!.toInt()
    }
  }

  @Throws(SecurityException::class)
  private fun deleteCalendar(calendarId: String): Boolean {
    val uri = ContentUris.withAppendedId(CalendarContract.Calendars.CONTENT_URI, calendarId.toInt().toLong())
    val rows = contentResolver.delete(uri, null, null)
    return rows > 0
  }

  @Throws(EventNotSavedException::class, ParseException::class, SecurityException::class, InvalidArgumentException::class)
  private fun saveEvent(details: ReadableArguments): Int {
    val calendarEventBuilder = CalendarEvenBuilder(details)
    if (details.containsKey("startDate")) {
      val startCal = Calendar.getInstance()
      val startDate = details["startDate"]
      try {
        when (startDate) {
          is String -> {
            val parsedDate = sdf.parse(startDate)
            if (parsedDate != null) {
              startCal.time = parsedDate
              calendarEventBuilder.put(CalendarContract.Events.DTSTART, startCal.timeInMillis)
            } else {
              Log.e(TAG, "Parsed date is null")
            }
          }
          is Number -> {
            calendarEventBuilder.put(CalendarContract.Events.DTSTART, startDate.toLong())
          }
          else -> {
            Log.e(TAG, "startDate has unsupported type")
          }
        }
      } catch (e: ParseException) {
        Log.e(TAG, "error", e)
        throw e
      }
    }
    if (details.containsKey("endDate")) {
      val endCal = Calendar.getInstance()
      val endDate = details["endDate"]
      try {
        if (endDate is String) {
          val parsedDate = sdf.parse(endDate)
          if (parsedDate != null) {
            endCal.time = parsedDate
            calendarEventBuilder.put(CalendarContract.Events.DTEND, endCal.timeInMillis)
          } else {
            Log.e(TAG, "Parsed date is null")
          }
        } else if (endDate is Number) {
          calendarEventBuilder.put(CalendarContract.Events.DTEND, endDate.toLong())
        }
      } catch (e: ParseException) {
        Log.e(TAG, "error", e)
        throw e
      }
    }
    if (details.containsKey("recurrenceRule")) {
      val recurrenceRule = details.getArguments("recurrenceRule")
      if (recurrenceRule.containsKey("frequency")) {
        val frequency = recurrenceRule.getString("frequency")
        var interval: Int? = null
        var occurrence: Int? = null
        var endDate: String? = null
        if (recurrenceRule.containsKey("interval")) {
          interval = recurrenceRule.getInt("interval")
        }
        if (recurrenceRule.containsKey("occurrence")) {
          occurrence = recurrenceRule.getInt("occurrence")
        }
        if (recurrenceRule.containsKey("endDate")) {
          val format = SimpleDateFormat("yyyyMMdd'T'HHmmss'Z'")
          val endDateObj = recurrenceRule["endDate"]
          if (endDateObj is String) {
            val parsedDate = sdf.parse(endDateObj)
            if (parsedDate != null) {
              endDate = format.format(parsedDate)
            } else {
              Log.e(TAG, "endDate is null")
            }
          } else if (endDateObj is Number) {
            val calendar = Calendar.getInstance()
            calendar.timeInMillis = endDateObj.toLong()
            endDate = format.format(calendar.time)
          }
        }
        if (endDate == null && occurrence == null) {
          val eventStartDate = calendarEventBuilder.getAsLong(CalendarContract.Events.DTSTART)
          val eventEndDate = calendarEventBuilder.getAsLong(CalendarContract.Events.DTEND)
          val duration = (eventEndDate - eventStartDate) / 1000
          calendarEventBuilder
            .putNull(CalendarContract.Events.LAST_DATE)
            .putNull(CalendarContract.Events.DTEND)
            .put(CalendarContract.Events.DURATION, "PT${duration}S")
        }
        val rule = createRecurrenceRule(frequency, interval, endDate, occurrence)
        calendarEventBuilder.put(CalendarContract.Events.RRULE, rule)
      }
    }

    calendarEventBuilder
      .putEventBoolean(CalendarContract.Events.HAS_ALARM, "alarms", true)
      .putEventString(CalendarContract.Events.AVAILABILITY, "availability", ::availabilityConstantMatchingString)
      .putEventString(CalendarContract.Events.TITLE, "title")
      .putEventString(CalendarContract.Events.DESCRIPTION, "notes")
      .putEventString(CalendarContract.Events.EVENT_LOCATION, "location")
      .putEventString(CalendarContract.Events.ORGANIZER, "organizerEmail")
      .putEventBoolean(CalendarContract.Events.ALL_DAY, "allDay")
      .putEventBoolean(CalendarContract.Events.GUESTS_CAN_MODIFY, "guestsCanModify")
      .putEventBoolean(CalendarContract.Events.GUESTS_CAN_INVITE_OTHERS, "guestsCanInviteOthers")
      .putEventBoolean(CalendarContract.Events.GUESTS_CAN_SEE_GUESTS, "guestsCanSeeGuests")
      .putEventTimeZone(CalendarContract.Events.EVENT_TIMEZONE, "timeZone")
      .putEventTimeZone(CalendarContract.Events.EVENT_END_TIMEZONE, "endTimeZone")
      .putEventString(CalendarContract.Events.ACCESS_LEVEL, "accessLevel", ::accessConstantMatchingString)

    return if (details.containsKey("id")) {
      val eventID = details.getString("id").toInt()
      val updateUri = ContentUris.withAppendedId(CalendarContract.Events.CONTENT_URI, eventID.toLong())
      contentResolver.update(updateUri, calendarEventBuilder.build(), null, null)
      removeRemindersForEvent(eventID)
      if (details.containsKey("alarms")) {
        createRemindersForEvent(eventID, details.getList("alarms"))
      }
      eventID
    } else {
      if (details.containsKey("calendarId")) {
        val calendar = findCalendarById(details.getString("calendarId"))
        if (calendar != null) {
          calendarEventBuilder.put(CalendarContract.Events.CALENDAR_ID, calendar.getString("id")!!.toInt())
        } else {
          throw InvalidArgumentException("Couldn't find calendar with given id: " + details.getString("calendarId"))
        }
      } else {
        throw InvalidArgumentException("CalendarId is required.")
      }
      val eventsUri = CalendarContract.Events.CONTENT_URI
      val eventUri = contentResolver.insert(eventsUri, calendarEventBuilder.build())
        ?: throw EventNotSavedException()
      val eventID = eventUri.lastPathSegment!!.toInt()
      if (details.containsKey("alarms")) {
        createRemindersForEvent(eventID, details.getList("alarms"))
      }
      eventID
    }
  }

  @Throws(ParseException::class, SecurityException::class)
  private fun removeEvent(details: ReadableArguments): Boolean {
    val rows: Int
    val eventID = details.getString("id").toInt()
    if (!details.containsKey("instanceStartDate")) {
      val uri = ContentUris.withAppendedId(CalendarContract.Events.CONTENT_URI, eventID.toLong())
      rows = contentResolver.delete(uri, null, null)
      return rows > 0
    } else {
      val exceptionValues = ContentValues()
      val startCal = Calendar.getInstance()
      val instanceStartDate = details["instanceStartDate"]
      try {
        if (instanceStartDate is String) {
          val parsedDate = sdf.parse(instanceStartDate)
          if (parsedDate != null) {
            startCal.time = parsedDate
            exceptionValues.put(CalendarContract.Events.ORIGINAL_INSTANCE_TIME, startCal.timeInMillis)
          } else {
            Log.e(TAG, "Parsed date is null")
          }
        } else if (instanceStartDate is Number) {
          exceptionValues.put(CalendarContract.Events.ORIGINAL_INSTANCE_TIME, instanceStartDate.toLong())
        }
      } catch (e: ParseException) {
        Log.e(TAG, "error", e)
        throw e
      }
      exceptionValues.put(CalendarContract.Events.STATUS, CalendarContract.Events.STATUS_CANCELED)
      val exceptionUri = ContentUris.withAppendedId(CalendarContract.Events.CONTENT_EXCEPTION_URI, eventID.toLong())
      contentResolver.insert(exceptionUri, exceptionValues)
    }
    return true
  }

  @Throws(Exception::class, SecurityException::class)
  private fun saveAttendeeForEvent(details: ReadableArguments, eventID: String?): Int {
    val isNew = !details.containsKey("id") // this is
    val attendeeBuilder = AttendeeBuilder(details)
      .putString("name", CalendarContract.Attendees.ATTENDEE_NAME)
      .putString("email", CalendarContract.Attendees.ATTENDEE_EMAIL, isNew)
      .putString("role", CalendarContract.Attendees.ATTENDEE_RELATIONSHIP, isNew, ::attendeeRelationshipConstantMatchingString)
      .putString("type", CalendarContract.Attendees.ATTENDEE_TYPE, isNew, ::attendeeTypeConstantMatchingString)
      .putString("status", CalendarContract.Attendees.ATTENDEE_STATUS, isNew, ::attendeeStatusConstantMatchingString)

    return if (isNew) {
      attendeeBuilder.put(CalendarContract.Attendees.EVENT_ID, eventID?.toInt())
      val attendeesUri = CalendarContract.Attendees.CONTENT_URI
      val attendeeUri = contentResolver.insert(attendeesUri, attendeeBuilder.build())
      attendeeUri!!.lastPathSegment!!.toInt()
    } else {
      val attendeeID = details.getString("id").toInt()
      val updateUri = ContentUris.withAppendedId(CalendarContract.Attendees.CONTENT_URI, attendeeID.toLong())
      contentResolver.update(updateUri, attendeeBuilder.build(), null, null)
      attendeeID
    }
  }

  @Throws(SecurityException::class)
  private fun deleteAttendee(attendeeID: String): Boolean {
    val rows: Int
    val uri = ContentUris.withAppendedId(CalendarContract.Attendees.CONTENT_URI, attendeeID.toInt().toLong())
    rows = contentResolver.delete(uri, null, null)
    return rows > 0
  }

  @Throws(SecurityException::class)
  private fun createRemindersForEvent(eventID: Int, reminders: List<*>) {
    for (i in reminders.indices) {
      val reminder = reminders[i] as Map<*, *>
      val relativeOffset = reminder["relativeOffset"]
      if (relativeOffset is Number) {
        val minutes = -relativeOffset.toInt()
        var method = CalendarContract.Reminders.METHOD_DEFAULT
        val reminderValues = ContentValues()
        if (reminder.containsKey("method")) {
          method = reminderConstantMatchingString(reminder["method"] as? String)
        }
        reminderValues.put(CalendarContract.Reminders.EVENT_ID, eventID)
        reminderValues.put(CalendarContract.Reminders.MINUTES, minutes)
        reminderValues.put(CalendarContract.Reminders.METHOD, method)
        contentResolver.insert(CalendarContract.Reminders.CONTENT_URI, reminderValues)
      }
    }
  }

  @Throws(SecurityException::class)
  private fun removeRemindersForEvent(eventID: Int) {
    val cursor = CalendarContract.Reminders.query(contentResolver, eventID.toLong(), arrayOf(
      CalendarContract.Reminders._ID
    ))
    while (cursor.moveToNext()) {
      val reminderUri = ContentUris.withAppendedId(CalendarContract.Reminders.CONTENT_URI, cursor.getLong(0))
      contentResolver.delete(reminderUri, null, null)
    }
  }

  private fun createRecurrenceRule(recurrence: String, interval: Int?, endDate: String?, occurrence: Int?): String {
    var rrule: String = when (recurrence) {
      "daily" -> "FREQ=DAILY"
      "weekly" -> "FREQ=WEEKLY"
      "monthly" -> "FREQ=MONTHLY"
      "yearly" -> "FREQ=YEARLY"
      else -> ""
    }
    if (interval != null) {
      rrule += ";INTERVAL=$interval"
    }
    if (endDate != null) {
      rrule += ";UNTIL=$endDate"
    } else if (occurrence != null) {
      rrule += ";COUNT=$occurrence"
    }
    return rrule
  }

  private fun serializeEvents(cursor: Cursor): List<Bundle> {
    val results: MutableList<Bundle> = ArrayList()
    while (cursor.moveToNext()) {
      results.add(serializeEvent(cursor))
    }
    return results
  }

  private fun serializeEvent(cursor: Cursor): Bundle {
    val foundStartDate = Calendar.getInstance()
    val foundEndDate = Calendar.getInstance()
    var startDateUTC = ""
    var endDateUTC = ""

    // may be CalendarContract.Instances.BEGIN or CalendarContract.Events.DTSTART (which have different string values)
    val startDate = cursor.getString(3)
    if (startDate != null) {
      foundStartDate.timeInMillis = startDate.toLong()
      startDateUTC = sdf.format(foundStartDate.time)
    }

    // may be CalendarContract.Instances.END or CalendarContract.Events.DTEND (which have different string values)
    val endDate = cursor.getString(4)
    if (endDate != null) {
      foundEndDate.timeInMillis = endDate.toLong()
      endDateUTC = sdf.format(foundEndDate.time)
    }
    val rrule = optStringFromCursor(cursor, CalendarContract.Events.RRULE)
    val rruleBundle = if (rrule != null) {
      val recurrenceRule = Bundle()
      val recurrenceRules = rrule.split(";").toTypedArray()
      recurrenceRule.putString("frequency", recurrenceRules[0].split("=").toTypedArray()[1].toLowerCase(Locale.getDefault()))
      if (recurrenceRules.size >= 2 && recurrenceRules[1].split("=").toTypedArray()[0] == "INTERVAL") {
        recurrenceRule.putInt("interval", recurrenceRules[1].split("=").toTypedArray()[1].toInt())
      }
      if (recurrenceRules.size >= 3) {
        val terminationRules = recurrenceRules[2].split("=").toTypedArray()
        if (terminationRules.size >= 2) {
          if (terminationRules[0] == "UNTIL") {
            try {
              recurrenceRule.putString("endDate", sdf.parse(terminationRules[1])?.toString())
            } catch (e: ParseException) {
              Log.e(TAG, "Couldn't parse the `endDate` property.", e)
            } catch (e: NullPointerException) {
              Log.e(TAG, "endDate is null", e)
            }
          } else if (terminationRules[0] == "COUNT") {
            recurrenceRule.putInt("occurrence", recurrenceRules[2].split("=").toTypedArray()[1].toInt())
          }
        }
        Log.e(TAG, "Couldn't parse termination rules: '${recurrenceRules[2]}'.", null)
      }
      recurrenceRule
    } else {
      null
    }

    // may be CalendarContract.Instances.EVENT_ID or CalendarContract.Events._ID (which have different string values)
    val event = Bundle().apply {
      rruleBundle?.let {
        putBundle("recurrenceRule", it)
      }
      putString("id", cursor.getString(0))
      putString("calendarId", optStringFromCursor(cursor, CalendarContract.Events.CALENDAR_ID))
      putString("title", optStringFromCursor(cursor, CalendarContract.Events.TITLE))
      putString("notes", optStringFromCursor(cursor, CalendarContract.Events.DESCRIPTION))
      putString("startDate", startDateUTC)
      putString("endDate", endDateUTC)
      putBoolean("allDay", optIntFromCursor(cursor, CalendarContract.Events.ALL_DAY) != 0)
      putString("location", optStringFromCursor(cursor, CalendarContract.Events.EVENT_LOCATION))
      putString("availability", availabilityStringMatchingConstant(optIntFromCursor(cursor, CalendarContract.Events.AVAILABILITY)))
      putParcelableArrayList("alarms", serializeAlarms(cursor.getLong(0)))
      putString("organizerEmail", optStringFromCursor(cursor, CalendarContract.Events.ORGANIZER))
      putString("timeZone", optStringFromCursor(cursor, CalendarContract.Events.EVENT_TIMEZONE))
      putString("endTimeZone", optStringFromCursor(cursor, CalendarContract.Events.EVENT_END_TIMEZONE))
      putString("accessLevel", accessStringMatchingConstant(optIntFromCursor(cursor, CalendarContract.Events.ACCESS_LEVEL)))
      putBoolean("guestsCanModify", optIntFromCursor(cursor, CalendarContract.Events.GUESTS_CAN_MODIFY) != 0)
      putBoolean("guestsCanInviteOthers", optIntFromCursor(cursor, CalendarContract.Events.GUESTS_CAN_INVITE_OTHERS) != 0)
      putBoolean("guestsCanSeeGuests", optIntFromCursor(cursor, CalendarContract.Events.GUESTS_CAN_SEE_GUESTS) != 0)
      putString("originalId", optStringFromCursor(cursor, CalendarContract.Events.ORIGINAL_ID))
    }

    // unfortunately the string values of CalendarContract.Events._ID and CalendarContract.Instances._ID are equal
    // so we'll use the somewhat brittle column number from the query
    if (cursor.columnCount > 18) {
      event.putString("instanceId", cursor.getString(18))
    }
    return event
  }

  private fun serializeAlarms(eventID: Long): ArrayList<Bundle> {
    val alarms = ArrayList<Bundle>()
    val cursor = CalendarContract.Reminders.query(contentResolver, eventID, arrayOf(
      CalendarContract.Reminders.MINUTES,
      CalendarContract.Reminders.METHOD
    ))
    while (cursor.moveToNext()) {
      val thisAlarm = Bundle()
      thisAlarm.putInt("relativeOffset", -cursor.getInt(0))
      val method = cursor.getInt(1)
      thisAlarm.putString("method", reminderStringMatchingConstant(method))
      alarms.add(thisAlarm)
    }
    return alarms
  }

  private fun serializeEventCalendars(cursor: Cursor): List<Bundle> {
    val results: MutableList<Bundle> = ArrayList()
    while (cursor.moveToNext()) {
      results.add(serializeEventCalendar(cursor))
    }
    return results
  }

  private fun serializeEventCalendar(cursor: Cursor): Bundle {
    val calendar = Bundle().apply {
      putString("id", optStringFromCursor(cursor, CalendarContract.Calendars._ID))
      putString("title", optStringFromCursor(cursor, CalendarContract.Calendars.CALENDAR_DISPLAY_NAME))
      putBoolean("isPrimary", optStringFromCursor(cursor, CalendarContract.Calendars.IS_PRIMARY) === "1")
      putStringArrayList("allowedAvailabilities", calendarAllowedAvailabilitiesFromDBString(stringFromCursor(cursor, CalendarContract.Calendars.ALLOWED_AVAILABILITY)))
      putString("name", optStringFromCursor(cursor, CalendarContract.Calendars.NAME))
      putString("color", String.format("#%06X", 0xFFFFFF and optIntFromCursor(cursor, CalendarContract.Calendars.CALENDAR_COLOR)))
      putString("ownerAccount", optStringFromCursor(cursor, CalendarContract.Calendars.OWNER_ACCOUNT))
      putString("timeZone", optStringFromCursor(cursor, CalendarContract.Calendars.CALENDAR_TIME_ZONE))
      putStringArrayList("allowedReminders", calendarAllowedRemindersFromDBString(stringFromCursor(cursor, CalendarContract.Calendars.ALLOWED_REMINDERS)))
      putStringArrayList("allowedAttendeeTypes", calendarAllowedAttendeeTypesFromDBString(stringFromCursor(cursor, CalendarContract.Calendars.ALLOWED_ATTENDEE_TYPES)))
      putBoolean("isVisible", optIntFromCursor(cursor, CalendarContract.Calendars.VISIBLE) != 0)
      putBoolean("isSynced", optIntFromCursor(cursor, CalendarContract.Calendars.SYNC_EVENTS) != 0)
      val accessLevel = optIntFromCursor(cursor, CalendarContract.Calendars.CALENDAR_ACCESS_LEVEL)
      putString("accessLevel", calAccessStringMatchingConstant(accessLevel))
      putBoolean(
        "allowsModifications",
        accessLevel == CalendarContract.Calendars.CAL_ACCESS_ROOT
          or CalendarContract.Calendars.CAL_ACCESS_OWNER
          or CalendarContract.Calendars.CAL_ACCESS_EDITOR
          or CalendarContract.Calendars.CAL_ACCESS_CONTRIBUTOR
      )
    }
    val source = Bundle().apply {
      putString("name", optStringFromCursor(cursor, CalendarContract.Calendars.ACCOUNT_NAME))
      val type = optStringFromCursor(cursor, CalendarContract.Calendars.ACCOUNT_TYPE)
      putString("type", type)
      putBoolean("isLocalAccount", type == CalendarContract.ACCOUNT_TYPE_LOCAL)
    }
    calendar.putBundle("source", source)
    return calendar
  }

  private fun serializeAttendees(cursor: Cursor): List<Bundle> {
    val results: MutableList<Bundle> = ArrayList()
    while (cursor.moveToNext()) {
      results.add(serializeAttendee(cursor))
    }
    return results
  }

  private fun serializeAttendee(cursor: Cursor): Bundle = Bundle().apply {
    putString("id", optStringFromCursor(cursor, CalendarContract.Attendees._ID))
    putString("name", optStringFromCursor(cursor, CalendarContract.Attendees.ATTENDEE_NAME))
    putString("email", optStringFromCursor(cursor, CalendarContract.Attendees.ATTENDEE_EMAIL))
    putString("role", attendeeRelationshipStringMatchingConstant(optIntFromCursor(cursor, CalendarContract.Attendees.ATTENDEE_RELATIONSHIP)))
    putString("type", attendeeTypeStringMatchingConstant(optIntFromCursor(cursor, CalendarContract.Attendees.ATTENDEE_TYPE)))
    putString("status", attendeeStatusStringMatchingConstant(optIntFromCursor(cursor, CalendarContract.Attendees.ATTENDEE_STATUS)))
  }

  private fun optStringFromCursor(cursor: Cursor, columnName: String): String? {
    val index = cursor.getColumnIndex(columnName)
    return if (index == -1) {
      null
    } else {
      cursor.getString(index)
    }
  }

  private fun stringFromCursor(cursor: Cursor, columnName: String): String {
    val index = cursor.getColumnIndex(columnName)
    if (index == -1) {
      throw Exception("String not found")
    } else {
      return cursor.getString(index)
    }
  }

  private fun optIntFromCursor(cursor: Cursor, columnName: String): Int {
    val index = cursor.getColumnIndex(columnName)
    return if (index == -1) {
      0
    } else {
      cursor.getInt(index)
    }
  }

  private fun checkPermissions(promise: Promise): Boolean {
    if (!mPermissions.hasGrantedPermissions(Manifest.permission.READ_CALENDAR, Manifest.permission.WRITE_CALENDAR)) {
      promise.reject("E_MISSING_PERMISSIONS", "CALENDAR permission is required to do this operation.")
      return false
    }
    return true
  }

  private fun setDateInCalendar(calendar: Calendar, date: Any) {
    when (date) {
      is String -> {
        val parsedDate = sdf.parse(date)
        if (parsedDate != null) {
          calendar.time = parsedDate
        } else {
          Log.e(TAG, "Parsed date is null")
        }
      }
      is Number -> {
        calendar.timeInMillis = date.toLong()
      }
      else -> {
        Log.e(TAG, "date has unsupported type")
      }
    }
  }

  companion object {
    internal val TAG = CalendarModule::class.java.simpleName
  }
}
