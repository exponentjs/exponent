package expo.modules.devlauncher.launcher.errors

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.widget.BaseAdapter
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentActivity
import androidx.fragment.app.FragmentManager
import androidx.fragment.app.FragmentPagerAdapter
import com.facebook.react.ReactActivity
import expo.modules.devlauncher.DevLauncherController
import expo.modules.devlauncher.databinding.ErrorActivityContentViewBinding
import expo.modules.devlauncher.koin.DevLauncherKoinComponent
import expo.modules.devlauncher.launcher.DevLauncherControllerInterface
import expo.modules.devlauncher.launcher.errors.fragments.DevLauncherErrorConsoleFragment
import expo.modules.devlauncher.launcher.errors.fragments.DevLauncherErrorFragment
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import org.koin.core.component.inject
import java.lang.ref.WeakReference
import java.util.*

interface DevLauncherErrorActivityInterface {
  fun onViewErrorLogs()

  fun getErrors(): List<DevLauncherAppError>

  fun launchHome()

  fun reload()
}

class DevLauncherErrorActivity
  : FragmentActivity(),
  DevLauncherErrorActivityInterface,
  DevLauncherKoinComponent {
  val controller: DevLauncherControllerInterface by inject()

  private class ViewPagerAdapter(fm: FragmentManager) : FragmentPagerAdapter(fm, BEHAVIOR_RESUME_ONLY_CURRENT_FRAGMENT) {
    override fun getCount() = 2

    override fun getItem(position: Int): Fragment {
      return when (position) {
        0 -> DevLauncherErrorFragment()
        1 -> DevLauncherErrorConsoleFragment()
        else -> throw IllegalArgumentException("Illegal item index: $position.")
      }
    }
  }

  private lateinit var binding: ErrorActivityContentViewBinding

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    binding = ErrorActivityContentViewBinding.inflate(layoutInflater)
    binding.errorViewPager.adapter = ViewPagerAdapter(supportFragmentManager)
    setContentView(binding.root)
  }

  override fun onViewErrorLogs() {
    if (binding.errorViewPager.currentItem != 1) {
      binding.errorViewPager.currentItem = 1
    }
  }

  override fun getErrors(): List<DevLauncherAppError> {
    return errorQueue
  }

  override fun launchHome() {
    synchronized(errorQueue) {
      errorQueue.clear()
    }

    controller.navigateToLauncher()
  }

  override fun reload() {
    synchronized(errorQueue) {
      errorQueue.clear()
    }

    val appUrl = controller.latestLoadedApp

    if (appUrl == null) {
      controller.navigateToLauncher()
      return
    }

    GlobalScope.launch {
      controller
        .loadApp(
          appUrl,
          controller.appHost.reactInstanceManager.currentReactContext?.currentActivity as? ReactActivity?
        )
    }
  }

  override fun onBackPressed() {
    val pager = binding.errorViewPager
    if (pager.currentItem != 0) {
      pager.currentItem = pager.currentItem - 1
    } else {
      super.onBackPressed()
    }
  }

  companion object {
    private var openedErrorActivity = WeakReference<DevLauncherErrorActivity?>(null)
    private val errorQueue = LinkedList<DevLauncherAppError>()

    fun showError(activity: Activity, error: DevLauncherAppError) {
      addError(error)

      if (openedErrorActivity.get() == null) {
        activity.startActivity(
          Intent(activity, DevLauncherErrorActivity::class.java)
        )
      }
    }

    fun addError(error: DevLauncherAppError) {
      synchronized(errorQueue) {
        errorQueue.addFirst(error)
      }

      openedErrorActivity.get()?.let {
        if (it.isDestroyed || it.isFinishing || it.binding.errorViewPager.currentItem != 1) {
          return
        }

        it.runOnUiThread {
          val fragment = it.supportFragmentManager.fragments[it.binding.errorViewPager.currentItem]
          if (fragment is DevLauncherErrorConsoleFragment) {
            (fragment.binding.listView.adapter as? BaseAdapter)?.notifyDataSetChanged()
          }
        }
      }
    }
  }
}
