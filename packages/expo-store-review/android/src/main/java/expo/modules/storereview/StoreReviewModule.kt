package expo.modules.storereview

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import com.google.android.gms.common.GooglePlayServicesUtil
import com.google.android.play.core.review.ReviewManager
import com.google.android.play.core.review.ReviewManagerFactory
import org.unimodules.core.ExportedModule
import org.unimodules.core.ModuleRegistry
import org.unimodules.core.Promise
import org.unimodules.core.interfaces.ActivityProvider
import org.unimodules.core.interfaces.ExpoMethod

class StoreReviewModule(private val mContext: Context) :
  ExportedModule(mContext) {
  companion object {
    private const val NAME = "ExpoStoreReview"
  }

  private lateinit var mActivityProvider: ActivityProvider

  override fun getName(): String {
    return NAME
  }

  override fun onCreate(moduleRegistry: ModuleRegistry) {
    mActivityProvider = moduleRegistry.getModule(ActivityProvider::class.java)
  }

  @ExpoMethod
  fun isAvailableAsync(promise: Promise) {
    if (Build.VERSION.SDK_INT >= 21 && isPlayStoreInstalled()) {
      promise.resolve(true)
    } else {
      promise.resolve(false)
    }
  }

  @ExpoMethod
  fun requestReview(promise: Promise) {
    val manager: ReviewManager = ReviewManagerFactory.create(mContext)
    val request = manager.requestReviewFlow()
    request.addOnCompleteListener { task ->
      if (task.isSuccessful) {
        val reviewInfo = task.result
        val flow = manager.launchReviewFlow(mActivityProvider.currentActivity, reviewInfo)
        flow.addOnCompleteListener { task ->
          if (task.isSuccessful) {
            promise.resolve(null)
          } else {
            promise.reject("ERR_STORE_REVIEW_FAILED", "Android ReviewManager task failed")
          }
        }
      } else {
        promise.reject("ERR_STORE_REVIEW_FAILED", "Android ReviewManager flow failed")
      }
    }
  }

  private fun isPlayStoreInstalled(): Boolean {
    return try {
      mContext.packageManager
              .getPackageInfo(GooglePlayServicesUtil.GOOGLE_PLAY_STORE_PACKAGE, 0)
      true
    } catch (e: PackageManager.NameNotFoundException) {
      false
    }
  }
}
