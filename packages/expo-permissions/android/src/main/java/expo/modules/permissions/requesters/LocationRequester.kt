package expo.modules.permissions.requesters

import android.Manifest
import android.os.Bundle
import expo.modules.permissions.PermissionsService
import expo.modules.permissions.DENIED_VALUE
import expo.modules.permissions.EXPIRES_KEY
import expo.modules.permissions.GRANTED_VALUE
import expo.modules.permissions.PERMISSION_EXPIRES_NEVER
import expo.modules.permissions.PermissionsTypes.LOCATION
import expo.modules.permissions.STATUS_KEY
import expo.modules.permissions.UNDETERMINED_VALUE

class LocationRequester(private val permissionsService: PermissionsService) : PermissionRequester {
  override fun getPermissionToAsk(): Array<String> = arrayOf(
      Manifest.permission.ACCESS_FINE_LOCATION,
      Manifest.permission.ACCESS_COARSE_LOCATION
  )

  override fun getPermission(): Bundle {
    return Bundle().apply {
      var scope = "none"
      try {
        when {
          permissionsService.isPermissionGranted(Manifest.permission.ACCESS_FINE_LOCATION) -> {
            putString(STATUS_KEY, GRANTED_VALUE)
            scope = "fine"
          }
          permissionsService.isPermissionGranted(Manifest.permission.ACCESS_COARSE_LOCATION) -> {
            putString(STATUS_KEY, GRANTED_VALUE)
            scope = "coarse"
          }
          permissionsService.didAsk(LOCATION.type) -> {
            putString(STATUS_KEY, DENIED_VALUE)
          }
          else -> {
            putString(STATUS_KEY, UNDETERMINED_VALUE)
          }
        }
      } catch (e: IllegalStateException) {
        putString(STATUS_KEY, UNDETERMINED_VALUE)
      }

      putString(EXPIRES_KEY, PERMISSION_EXPIRES_NEVER)
      putBundle("android", Bundle().apply { putString("scope", scope) })
    }
  }
}
