package expo.modules.notifications.service.delegates

import android.content.Context
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.ProcessLifecycleOwner
import expo.modules.notifications.notifications.NotificationManager
import expo.modules.notifications.notifications.model.Notification
import expo.modules.notifications.notifications.model.NotificationResponse
import expo.modules.notifications.service.NotificationsService
import expo.modules.notifications.service.interfaces.HandlingDelegate
import java.lang.ref.WeakReference
import java.util.*

class ExpoHandlingDelegate(protected val context: Context) : HandlingDelegate {
  companion object {
    /**
     * A weak map of listeners -> reference. Used to check quickly whether given listener
     * is already registered and to iterate over when notifying of new token.
     */
    protected var sListenersReferences = WeakHashMap<NotificationManager, WeakReference<NotificationManager>>()

    /**
     * Used only by [NotificationManager] instances. If you look for a place to register
     * your listener, use [NotificationManager] singleton module.
     *
     *
     * Purposefully the argument is expected to be a [NotificationManager] and just a listener.
     *
     *
     * This class doesn't hold strong references to listeners, so you need to own your listeners.
     *
     * @param listener A listener instance to be informed of new push device tokens.
     */
    fun addListener(listener: NotificationManager) {
      // Checks whether this listener has already been registered
      if (!sListenersReferences.containsKey(listener)) {
        val listenerReference = WeakReference(listener)
        sListenersReferences[listener] = listenerReference
        if (!sPendingNotificationResponses.isEmpty()) {
          val responseIterator = sPendingNotificationResponses.iterator()
          while (responseIterator.hasNext()) {
            listener.onNotificationResponseReceived(responseIterator.next())
            responseIterator.remove()
          }
        }
      }
    }
  }
  override fun handleNotification(notification: Notification) {
  }

  override fun handleNotificationResponse(notificationResponse: NotificationResponse) {
  }

  override fun handleNotificationsDropped() {
}
